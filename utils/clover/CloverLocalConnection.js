import * as clover from "remote-pay-cloud";
import {FirebaseClient} from "../firebase/FirebaseClient";

export class CloverLocalConnection {

    constructor(authToken) {
        this.onPairSuccess = null;
        this.authToken = authToken;
        this.onConnected = null;
        this.cloverConnector = null;
        this.pendingSaleRequest = null;
        this.onPaymentSuccess = null;
        this.onPaymentFailed = null;
        this.onPaymentPartial = null;
        this.onStatusUpdate = null;
    }

    checkPaymentStatus() {
        if (this.pendingSaleRequest) {
            // If a message was lost etc. the retrieveDevice status request will ask the device to send the last message.
            // This can help the POS recover if the device is stuck on a challenge screen, etc.  The last message will
            // be sent independently of the retrieveDeviceStatus response and thus the retrieveDeviceStatus response
            // does not need to be checked.
            const retrieveDeviceStatusRequest = new clover.remotepay.RetrieveDeviceStatusRequest();
            retrieveDeviceStatusRequest.setSendLastMessage(true);
            this.cloverConnector.retrieveDeviceStatus(retrieveDeviceStatusRequest);
            // Retrieve the payment status.
            this.updateStatus(`Payment ${this.pendingSaleRequest.getExternalId()} is currently pending.  Checking payment status ...`);
            const retrievePaymentRequest = new clover.remotepay.RetrievePaymentRequest();
            retrievePaymentRequest.setExternalPaymentId(this.pendingSaleRequest.getExternalId());
            this.cloverConnector.retrievePayment(retrievePaymentRequest);
        } else {
            this.updateStatus(`There is currently no pending payment.`);
        }
    }

    resetDevice() {
        if (this.pendingSaleRequest) {
            this.checkPaymentStatus();
        } else {
            this.cloverConnector.resetDevice();
        }
    }

    forceResetDevice() {
        this.cloverConnector.resetDevice();
    }

    showMessage(message) {
        this.cloverConnector.showMessage(message);
    }

    cleanup() {
        if (this.cloverConnector) {
            this.cloverConnector.dispose();
            this.toggleElement("actions", false);
            this.updateStatus("Not connected to your Clover device.  Please refresh the page to re-connect and perform an action.");
        }
    }

    async connect(connectionConfiguration = null) {
        this.cleanup(); // any existing connections.
        if (!connectionConfiguration) {
            connectionConfiguration = this.buildConnectionConfigFromWebForm();
        }

        clover.DebugConfig.loggingEnabled = true;
        let cloverDeviceConnectionConfiguration = null;
        if (this.isCloudConfig()) {
            const cloudFormValid = document.getElementById("cloudForm").checkValidity();
            if (!cloudFormValid) {
                this.updateStatus("The connection configuration is not valid.  Please update the form below and try again.", false);
                return false;
            }
            this.updateStatus("Attempting to connect to your Clover device, please wait  ....");
            // Configuration Note: See: https://docs.clover.com/build/getting-started-with-clover-connector/?sdk=browser for more information
            // on how to obtain the required connection parameter values.
            cloverDeviceConnectionConfiguration = getDeviceConfigurationForCloud(connectionConfiguration);
        } else {
            if (document.getElementById("networkForm")) {
                const networkFormValid = document.getElementById("networkForm").checkValidity();
                if (!networkFormValid) {
                    this.updateStatus("The connection configuration is not valid.  Please update the form below and try again.", false);
                    return false;
                }
                this.updateStatus("Attempting to connect to your Clover device, you may need to enter the manager PIN, please wait  ....");
            }
            cloverDeviceConnectionConfiguration = await this.getDeviceConfigurationForNetwork(connectionConfiguration);
        }

        this.toggleElement("connectionForm", false);
        let builderConfiguration = {};
        builderConfiguration[clover.CloverConnectorFactoryBuilder.FACTORY_VERSION] = clover.CloverConnectorFactoryBuilder.VERSION_12;
        let cloverConnectorFactory = clover.CloverConnectorFactoryBuilder.createICloverConnectorFactory(builderConfiguration);
        this.cloverConnector = await cloverConnectorFactory.createICloverConnector(cloverDeviceConnectionConfiguration);
        await this.cloverConnector.addCloverConnectorListener(this.buildCloverConnectionListener());
        await this.cloverConnector.initializeConnection();
        return this;
    }

    performSale(amount) {
        if (!this.pendingSaleRequest) {
            this.pendingSaleRequest = new clover.remotepay.SaleRequest();
            this.pendingSaleRequest.setExternalId(clover.CloverID.getNewId());
            this.pendingSaleRequest.setAmount(amount);
            this.pendingSaleRequest.setAutoAcceptSignature(true);
            this.pendingSaleRequest.setApproveOfflinePaymentWithoutPrompt(true);
            this.pendingSaleRequest.setDisableDuplicateChecking(true);
            this.pendingSaleRequest.setCardEntryMethods(clover.CardEntryMethods.ALL);
            console.log({message: "Sending sale", request: this.pendingSaleRequest});
            this.toggleElement("actions", false);
            this.updateStatus(`Payment: ${this.pendingSaleRequest.getExternalId()} for $${this.pendingSaleRequest.getAmount() / 100} is in progress.`, null, "pendingStatusContainer", "pendingMessage");
            // Send the sale to the device.
            this.cloverConnector.sale(this.pendingSaleRequest);
        } else {
            this.checkPaymentStatus();
        }
    }

    /**
     * Builds a configuration container from the web form.
     */
    buildConnectionConfigFromWebForm() {
        const config = {};

        if (this.isCloudConfig()) {
            config["applicationId"] = document.getElementById("cloudAppId").value;
            config["accessToken"] = document.getElementById("accessToken").value;
            config["cloverServer"] = document.getElementById("cloverServer").value;
            config["merchantId"] = document.getElementById("merchantId").value;
            config["deviceId"] = document.getElementById("deviceId").value;
            config["friendlyId"] = document.getElementById("friendlyId").value;
        } else {
            config["applicationId"] = document.getElementById("snpdAppId").value;
            config["endpoint"] = document.getElementById("endpoint").value;
            config["posName"] = document.getElementById("posName").value;
            config["serialNumber"] = document.getElementById("serialNumber").value;
            config["authToken"] = this.authToken;
        }
        return config;
    }

    isCloudConfig() {
        return false;
        // const cloudInfo = document.getElementById("cloudInfo");
        // return cloudInfo && cloudInfo.style.display === "block";
    }

    /**
     * Build and return the connection configuration object for cloud.
     *
     * @param connectionConfiguration
     * @returns {WebSocketCloudCloverDeviceConfiguration}
     */
    getDeviceConfigurationForCloud(connectionConfiguration) {
        const configBuilder = new clover.WebSocketCloudCloverDeviceConfigurationBuilder(connectionConfiguration.applicationId,
            connectionConfiguration.deviceId, connectionConfiguration.merchantId, connectionConfiguration.accessToken);
        configBuilder.setCloverServer(connectionConfiguration.cloverServer);
        configBuilder.setFriendlyId(connectionConfiguration.friendlyId);
        configBuilder.setHeartbeatInterval(1000);
        configBuilder.setForceConnect(true);
        return configBuilder.build();
    }

    /**
     * Build and return the connection configuration object for network. When initially connecting to Secure Network
     * Pay Display pairing is required.  The configuration object provides callbacks so the application can
     * handle the pairing however it chooses.  In this case we update a UI element on the web page with the
     * pairing code that must be entered on the device to establish the connection.  The authToken returned
     * in onPairingSuccess can be saved and used later to avoid pairing for subsequent connection attempts.
     *
     * @param connectionConfiguration
     * @returns {WebSocketPairedCloverDeviceConfiguration}
     */
    getDeviceConfigurationForNetwork(connectionConfiguration) {
        const onPairingCode = (pairingCode) => {
            const pairingCodeMessage = `Please enter pairing code ${pairingCode} on the device`;
            this.updateStatus(pairingCodeMessage, true);
            console.log(`    >  ${pairingCodeMessage}`);
        };
        const onPairingSuccess = (authTokenFromPairing) => {
            console.log(`    > Got Pairing Auth Token: ${authTokenFromPairing}`);
            this.authToken = authTokenFromPairing;

            if (connectionConfiguration.id) {
                FirebaseClient.set("clover_devices", connectionConfiguration.id, {
                    authToken: authTokenFromPairing
                })
            }

            if (this.onPairSuccess) this.onPairSuccess(authTokenFromPairing)
        };

        const configBuilder = new clover.WebSocketPairedCloverDeviceConfigurationBuilder(
            connectionConfiguration.applicationId,
            connectionConfiguration.endpoint,
            connectionConfiguration.posName,
            connectionConfiguration.serialNumber,
            connectionConfiguration.authToken,
            onPairingCode,
            onPairingSuccess);

        return configBuilder.build();
    }

    toggleElement(eleId, show) {
        let actionsEle = document.getElementById(eleId);

        if (!actionsEle) return;

        if (show) {
            actionsEle.style.display = "flex";
        } else {
            actionsEle.style.display = "none";
        }
    }

    updateStatus(message, success, containerId = "statusContainer", messageId = "statusMessage") {
        this.toggleElement(containerId, true);
        const statusEle = document.getElementById(messageId);

        if (this.onStatusUpdate) {
            this.onStatusUpdate(message, success);
        }

        if (!statusEle) return;

        statusEle.innerHTML = message;

        if (success === false) {
            statusEle.className = "d-flex w-100 alert alert-danger";
            document.getElementById("connect-btn").disabled = false;
        } else if (success) {
            statusEle.className = "d-flex w-100 alert alert-success";
            document.getElementById("connect-btn").disabled = true;
        } else {
            statusEle.className = "d-flex w-100 alert alert-warning";
            if (document.getElementById("connect-btn")) {
                document.getElementById("connect-btn").disabled = true;
            }
        }
    }

    /**
     * Custom implementation of ICloverConnector listener, handles responses from the Clover device.
     */
    buildCloverConnectionListener() {
        const _this = this;
        return Object.assign({}, clover.remotepay.ICloverConnectorListener.prototype, {

            onSaleResponse: function (response) {
                console.log({message: "Payment response received", response: response});
                const requestAmount = _this.pendingSaleRequest.getAmount();
                const requestExternalId = _this.pendingSaleRequest.getExternalId();
                _this.pendingSaleRequest = null; // The sale is complete
                _this.toggleElement("actions", true);
                _this.toggleElement("pendingStatusContainer", false);
                if (response.getSuccess()) {
                    const payment = response.getPayment();
                    // We are choosing to void the payment if it was not authorized for the full amount.
                    if (payment && payment.getAmount() < requestAmount) {
                        const voidPaymentRequest = new clover.remotepay.VoidPaymentRequest();
                        voidPaymentRequest.setPaymentId(payment.getId());
                        voidPaymentRequest.setVoidReason(clover.order.VoidReason.REJECT_PARTIAL_AUTH);
                        _this.updateStatus(`The payment was approved for a partial amount ($${payment.getAmount() / 100}) and will be voided.`, false);
                        _this.cloverConnector.voidPayment(voidPaymentRequest);

                        if (_this.onPaymentPartial) {
                            _this.onPaymentPartial(response);
                        }
                    } else {
                        _this.updateStatus(`${payment.getResult()}: Payment ${payment.getExternalPaymentId()} for $${payment.getAmount() / 100} is complete.`, response.getResult() === clover.remotepay.ResultStatus.SUCCESS);

                        if (!response.getIsSale()) {
                            console.log({error: "Response is not a sale!"});
                        } else {
                            if (_this.onPaymentSuccess) {
                                _this.onPaymentSuccess(response);
                            }
                        }
                    }
                } else {
                    if (_this.onPaymentFailed) {
                        _this.onPaymentFailed(response);
                    }

                    _this.updateStatus(`Payment ${requestExternalId} for $${requestAmount / 100} has failed or was voided.`, false);
                    _this.resetDevice(); // The device may be stuck.
                }
            },

            onRetrievePaymentResponse: function (retrievePaymentResponse) {
                console.log({message: "onRetrievePaymentResponse", response: retrievePaymentResponse});
                if (_this.pendingSaleRequest) {
                    if (retrievePaymentResponse.getExternalPaymentId() === _this.pendingSaleRequest.getExternalId()) {
                        if (retrievePaymentResponse.getQueryStatus() === clover.remotepay.QueryStatus.FOUND) {
                            // The payment's status can be used to resolve the payment in your POS.
                            const payment = retrievePaymentResponse.getPayment();
                            _this.updateStatus(`${payment.getResult()}: Payment ${_this.pendingSaleRequest.getExternalId()} is complete.`, payment.getResult() === clover.remotepay.ResultStatus.SUCCESS);
                            _this.pendingSaleRequest = null; // The pending sale is complete.
                            _this.toggleElement("actions", true);
                            _this.toggleElement("pendingStatusContainer", false);
                        } else if (retrievePaymentResponse.getQueryStatus() === clover.remotepay.QueryStatus.IN_PROGRESS) {
                            // payment either not found or in progress,
                            _this.updateStatus(`Payment: ${_this.pendingSaleRequest.getExternalId()} for $${_this.pendingSaleRequest.getAmount() / 100} is in progress.   If you would like to start a new payment, you may reset the device.  However, doing so may void payment ${_this.pendingSaleRequest.getExternalId()}.  If you would like to reset the device anyway please <a onclick="forceResetDevice()" href="#">click here</a> to confirm.`, null, "pendingStatusContainer", "pendingMessage");
                        } else if (retrievePaymentResponse.getQueryStatus() === clover.remotepay.QueryStatus.NOT_FOUND) {
                            _this.updateStatus(`Payment: ${_this.pendingSaleRequest.getExternalId()} wasn't taken or was voided.`, false);
                            _this.toggleElement("pendingStatusContainer", false);
                        }
                    }
                }
            },

            onResetDeviceResponse(onResetDeviceResponse) {
                if (_this.pendingSaleRequest) {
                    // Verify the payment status, the reset will generally void payments, but not in all cases.
                    const retrievePaymentRequest = new clover.remotepay.RetrievePaymentRequest();
                    retrievePaymentRequest.setExternalPaymentId(_this.pendingSaleRequest.getExternalId());
                    _this.cloverConnector.retrievePayment(retrievePaymentRequest);
                }
            },

            // See https://docs.clover.com/build/working-with-challenges/
            onConfirmPaymentRequest: function (request) {
                console.log({message: "Automatically accepting payment", request: request});
                _this.updateStatus("Automatically accepting payment", true);
                //cloverConnector.acceptPayment(request.getPayment());
                // to reject a payment, pass the payment and the challenge that was the basis for the rejection
                // cloverConnector.rejectPayment(request.getPayment(), request.getChallenges()[REJECTED_CHALLENGE_INDEX]);
            },

            // See https://docs.clover.com/build/working-with-challenges/
            onVerifySignatureRequest: function (request) {
                console.log({message: "Automatically accepting signature", request: request});
                _this.updateStatus("Automatically accepting signature", true);
                _this.cloverConnector.acceptSignature(request);
                // to reject a signature, pass the request to verify
                // cloverConnector.rejectSignature(request);
            },

            // See https://docs.clover.com/clover-platform/docs/ui-state-messages
            onDeviceActivityStart: function (cloverDeviceEvent) {
                // We recommend using this handler to to notify the POS of what the device is doing and allow the
                // merchant to potentially take action on the customer's behalf (e.g. Would you like a receipt?).
                // For this simple example we will just display the event's message in the UI.
                _this.updateStatus(cloverDeviceEvent.message);
                console.log({message: "onDeviceActivityStart: ", cloverDeviceEvent});
            },

            onVoidPaymentResponse: function (response) {
                if (response.getSuccess()) {
                    _this.updateStatus("The payment was voided", true);
                } else {
                    _this.updateStatus("The payment could not be voided", false);
                }
            },

            onDeviceReady: function (merchantInfo) {
                _this.updateStatus("The connection to your Clover Device has been established.", true);
                _this.toggleElement("connectionForm", false);

                if (_this.onConnected !== null) _this.onConnected();

                if (!_this.pendingSaleRequest) {
                    console.log({message: "Device Ready to process requests!", merchantInfo: merchantInfo});
                    _this.toggleElement("actions", true);
                } else {
                    // We have an unresolved sale.  The connection to the device was lost and the customer is in the
                    // middle of or finished the payment with the POS disconnected.  Calling retrieveDeviceStatus
                    // with setSendLastMessage will ask the Clover device to send us the last message it
                    // sent which may allow us to proceed with the payment.
                    const retrieveDeviceStatusRequest = new clover.remotepay.RetrieveDeviceStatusRequest();
                    retrieveDeviceStatusRequest.setSendLastMessage(true);
                    _this.cloverConnector.retrieveDeviceStatus(retrieveDeviceStatusRequest);
                }
            },

            onDeviceError: function (cloverDeviceErrorEvent) {
                console.log({message: `An error has occurred: ${cloverDeviceErrorEvent.message}`});
                _this.updateStatus(`An error has occurred: ${cloverDeviceErrorEvent.message}`, false);
            },

            onDeviceDisconnected: function () {
                console.log({message: "You have been disconnected from the Clover device."});
                _this.updateStatus("The connection to your Clover Device has been dropped.", false);
                _this.toggleElement("connectionForm", true);
                _this.toggleElement("actions", false);
            }

        });
    }


}