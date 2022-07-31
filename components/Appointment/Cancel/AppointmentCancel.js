import {Checkbox, Loader, Notification, toaster} from "rsuite";
import React, {useEffect, useState} from "react";
import {useAuth} from "../../../context/AuthContext";
import ConfirmModal from "../../modals/ConfirmModal/ConfirmModal";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheckCircle, faExclamationTriangle} from "@fortawesome/free-solid-svg-icons";
import {APIConnector} from "../../APIConnector";
import {FirebaseClient} from "../../../utils/firebase/FirebaseClient";
import {MaskedInput} from "../../inputs/MaskedInput";
import {Field} from "../../inputs/Field";
import styles from "./styles.module.css";

export default function AppointmentCancel(props) {

    const {currentUser} = useAuth();
    const [charge, setCharge] = useState(false);
    const [response, setResponse] = useState(null);
    const [open, setOpen] = useState(true);
    const [bookingSettings, setBookingSettings] = useState(null);
    const [cancellationFee, setCancellationFee] = useState(0);

    useEffect(() => {
            (async () => {
                try {
                    const settings = await FirebaseClient.doc("settings", "booking");
                    setBookingSettings(settings);
                    if (settings["no_show_fee"]) {
                        setCancellationFee(parseFloat(settings["no_show_fee"].replace("$", "")));
                    }
                } catch (error) {
                    console.error(error);
                }
            })();
    }, []);

    return (
        <ConfirmModal title={response ? "Appointment Cancelled" : "Confirm"} open={open}
                      handleClose={() => setOpen(false)} disableConfirm={!bookingSettings} confirmText={response ? "Close" : "Submit"}
                      onConfirm={async () => {
                          if (response) {
                              setOpen(false);
                              return;
                          }

                          try {
                              const res = await (await APIConnector.create(10000, currentUser)).post(`/appointment/cancel?id=${props.appointment_id}`, {charge, cancellationFee});
                              setResponse(res.data.response);
                              if (props.onComplete) props.onComplete();
                          } catch (error) {
                              console.error(error);
                              toaster.push(<Notification type={"error"} header={"Failed to cancel appointment."}/>, {
                                  placement: 'topEnd'
                              });
                          }
                      }
                      }>
            <p>
                {response ? response.map((msg) => <><span style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "10px"
                    }}>{msg.trim().length === 0 ? <></> : msg.includes("Failed") ?
                        <FontAwesomeIcon icon={faExclamationTriangle} color={"red"}/> :
                        <FontAwesomeIcon icon={faCheckCircle} color={"green"}/>} {msg}</span></>) :
                    <>
                        <FontAwesomeIcon icon={faExclamationTriangle} color={"yellow"}/> Warning: Canceling an
                        appointment is
                        irreversible.
                        <br/><br/>
                        {props.appointment["clover_source"] ? !bookingSettings ? <Loader content={"Please wait..."}/> : (
                            <>
                                <Checkbox className={styles.cancelField} onChange={(valueType, value) => setCharge(value)}>
                                    Charge a
                                    <MaskedInput
                                        name="no_show_fee"
                                        mask={"$9999"}
                                        maskChar={""}
                                        defaultValue={bookingSettings["no_show_fee"]}
                                        onChange={(value) => setCancellationFee(parseFloat(value.replace("$", "")))}
                                    ></MaskedInput>
                                    no show fee.
                                </Checkbox>
                                <br/><br/>
                                Are you sure?
                            </>
                        ) : <>Are you sure?</>}

                    </>
                }
            </p>
        </ConfirmModal>
    )

}