import {Checkbox, Notification, toaster} from "rsuite";
import React, {useState} from "react";
import {useAuth} from "../../../context/AuthContext";
import ConfirmModal from "../../modals/ConfirmModal/ConfirmModal";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck, faCheckCircle, faExclamationTriangle} from "@fortawesome/free-solid-svg-icons";
import {APIConnector} from "../../APIConnector";

export default function AppointmentCancel(props) {

    const {currentUser} = useAuth();
    const [charge, setCharge] = useState(false);
    const [response, setResponse] = useState(null);
    const [open, setOpen] = useState(true);

    return (
        <ConfirmModal title={response ? "Appointment Cancelled" : "Confirm"} open={open} handleClose={() => setOpen(false)} confirmText={response ? "Close" : "Submit"} onConfirm={async () => {
            if (response) {
                setOpen(false);
                return;
            }

            try {
                const res = await (await APIConnector.create(10000, currentUser)).post(`/appointment/cancel?id=${props.appointment_id}`, {charge});
                setResponse(res.data.response);
            } catch (error) {
                console.error(error);
                toaster.push(<Notification type={"error"} header={"Failed to cancel appointment."}/>, {
                    placement: 'topEnd'
                });
            }
        }
        }>
            <p>
                {response ? response.map((msg) => <><span style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>{msg.trim().length === 0 ? <></> : msg.includes("Failed") ? <FontAwesomeIcon icon={faExclamationTriangle} color={"red"} /> : <FontAwesomeIcon icon={faCheckCircle} color={"green"} />} {msg}</span></>) :
                    <>
                        <FontAwesomeIcon icon={faExclamationTriangle} color={"yellow"}/> Warning: Canceling an
                        appointment is
                        irreversible.
                        <br/><br/>
                        <Checkbox onChange={(valueType, value) => setCharge(value)}>Charge $75 no show
                            fee.</Checkbox>
                        <br/><br/>
                        Are you sure?
                    </>
                }
            </p>
        </ConfirmModal>
    )

}