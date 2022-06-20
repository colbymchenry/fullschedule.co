import styles from './styles.module.css';
import ConfirmModal from "../ConfirmModal/ConfirmModal";
import {Button, Form, Schema} from "rsuite";
import {Field} from "../../inputs/Field";
import {MaskedInput} from "../../inputs/MaskedInput";
import React, {useEffect, useRef, useState} from "react";
import {useAuth} from "../../../context/AuthContext";
import {CloverLocalConnection} from "../../../utils/clover/CloverLocalConnection";
import {SettingsClient} from "../../../modals/SettingsClient";
import {FirebaseClient} from "../../../utils/firebase/FirebaseClient";
import {where} from "firebase/firestore";

const {StringType} = Schema.Types;

export default function NewCloverDeviceModal(props) {

    const [open, setOpen] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [formValue, setFormValue] = useState({});
    const [formError, setFormError] = useState({});
    const submitRef = useRef();
    const {currentUser} = useAuth();
    const [connected, setConnected] = useState(false);
    const [connection, setConnection] = useState(new CloverLocalConnection());
    const [settings, setSettings] = useState(null);

    connection.onConnected = () => setConnected(true);

    useEffect(() => {
        if (!settings) {
            (async () => {
                const s = await SettingsClient.getInstance();
                setSettings(s);
            })();
        }
    }, [])

    const submitForm = async () => {
        if (!connected) {
            await connection.connect();
            return;
        }

        setSubmitted(true);

        try {
            const queryResponse = await FirebaseClient.query("clover_devices", where("serialNumber", "==", formValue.serialNumber));

            if (queryResponse.length) {
                document.getElementById('statusMessage').innerHTML = formValue.serialNumber + " is already registered.";
                document.getElementById('statusMessage').className = "d-flex w-100 alert alert-danger";
                setSubmitted(false);
                return;
            }

            formValue["applicationId"] = settings.get("clover_app_id");
            formValue["authToken"] = connection.authToken;

            await FirebaseClient.add("clover_devices", formValue);

            setOpen(false);
        } catch (err) {
            console.error(err);
        }

        setSubmitted(false);
    }

    if (!settings) return <></>

    return (
        <ConfirmModal open={open} handleClose={() => setOpen(false)} title={"New Clover Device"} hideFooter>
            <Form id="networkForm" className={styles.form} formValue={formValue} onChange={formValue => {
                setFormValue(formValue);
                if (Object.keys(formError).length) setFormError({});
            }} disabled={submitted} readOnly={submitted}>
                <div className={styles.section}>
                    <Field
                        id={"snpdAppId"}
                        aria-describedby="snpdAppIdHelp"
                        value={settings.get("clover_app_id")}
                        name="snpdAppId"
                        readOnly
                        disabled
                        label="Application ID"
                        message={["The ", <a
                            key={Math.random()}
                            rel={"noreferrer"}
                            href="https://docs.clover.com/clover-platform/docs/create-your-remote-app-id"
                            target="_blank">remote
                            application ID
                            (RAID)</a>, " of the POS app."]}
                        accepter={MaskedInput}
                        error={formError["snpdAppId"]}
                    />

                    <Field
                        name="endpoint"
                        id={"endpoint"}
                        aria-describedby="deviceUriHelp"
                        placeholder="ws://enter-device-ip:12345/remote_pay"
                        label="Device URI"
                        message={"The URI is displayed on the start screen of Secure Network Pay Display."}
                        accepter={MaskedInput}
                        error={formError["endpoint"]}
                    />

                    <Field
                        name="posName"
                        id={"posName"}
                        aria-describedby="posNameHelp"
                        placeholder="CloudStarterPOS"
                        label="Device Name"
                        message={"A name displayed during pairing to identify the POS attempting to connect to the device."}
                        accepter={MaskedInput}
                        error={formError["posName"]}
                    />

                    <Field
                        name="serialNumber"
                        id={"serialNumber"}
                        aria-describedby="serialNumberHelp"
                        placeholder="Register_1"
                        label="POS Serial Number/Identifier"
                        message={"The serial number/identifier of the POS, as displayed in the Secure Network Pay Display app. Note: This is not the same as the Clover device’s serial number."}
                        accepter={MaskedInput}
                        error={formError["serialNumber"]}
                    />
                </div>

                <br />

                <Button type="button" id={"connect-btn"} onClick={submitForm}>
                    {connected ? "Save Clover Device" : "Connect to your Clover device"}
                </Button>

                <div className={`d-flex w-100 flex-column m-2`}>
                    <div className="w-100" id="statusContainer" style={{display: 'none'}}>
                        <div id="statusMessage" className="alert alert-warning d-flex w-100"></div>
                    </div>
                    <small style={{ marginTop: '1rem' }}><b>You must have Secure Network Pay Display installed and running on your
                        Clover device. If you would like to use a secure connection (wss) you will need to have the
                        Clover Device certificate installed in your web browser.</b></small>
                    <div className="w-100 justify-content-between mt-4" id="actions"
                         style={{display: 'none', gap: '0.5rem'}}>
                        <button type="button" onClick={() => connection.performSale(100)}
                                className="btn btn-success">Perform a sale
                        </button>
                        <button type="button" onClick={() => connection.showMessage("Test Message")}
                                className="btn btn-success">Show a
                            message
                            on your Clover device
                        </button>
                        <button type="button" onClick={() => connection.forceResetDevice()}
                                className="btn btn-success">Reset your
                            Clover device
                        </button>
                    </div>
                </div>
            </Form>
        </ConfirmModal>
    )

}