import {Notification, toaster} from "rsuite";
import React from "react";
import {APIConnector} from "../../APIConnector";
import {useAuth} from "../../../context/AuthContext";
import ConfirmModal from "../../modals/ConfirmModal/ConfirmModal";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faExclamationTriangle} from "@fortawesome/free-solid-svg-icons";

export default function AppointmentCancel(props) {

    const { currentUser } = useAuth();

    return (
        <ConfirmModal title={"Confirm"} onConfirm={async () => {
            try {
                await (await APIConnector.create(10000, currentUser)).post(`/appointment/cancel?id=${props.appointment_id}`, {});

                toaster.push(<Notification type={"success"} header={"Appointment canceled!"}/>, {
                    placement: 'topEnd'
                });
            } catch (error) {
                console.error(error);
                toaster.push(<Notification type={"error"} header={"Failed to cancel appointment."}/>, {
                    placement: 'topEnd'
                });
            }
        }
        }><p><FontAwesomeIcon icon={faExclamationTriangle} color={"yellow"}/> Warning: Canceling an appointment is irreversible.<br/><br/>Are you sure?</p></ConfirmModal>
    )

}