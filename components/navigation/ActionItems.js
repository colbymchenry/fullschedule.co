import React, {useEffect, useState} from "react";
import {SettingsClient} from "../../modals/SettingsClient";
import {useAuth} from "../../context/AuthContext";
import styles from "./styles.module.css";
import {toaster} from "rsuite";
import ConfirmModal from "../modals/ConfirmModal/ConfirmModal";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faExclamationTriangle} from "@fortawesome/free-solid-svg-icons";

export function ActionItems(props) {

    const [requirements, setRequirements] = useState([])
    const {refresh} = useAuth();

    useEffect(() => {
        (async () => {
            const settings = await SettingsClient.getInstance();
            const requiredFields = [
                "phone^Company phone number.",
                "time_zone^Time zone of location.",
                "address_city^City address.",
                "address_state^State address.",
                "address_street_line1^Street address.",
                "address_zip^Zip address.",
                "email_host^Email host.",
                "email_password^Email password.",
                "email_port^Email port.",
                "email_username^Email username.",
                "twilio_auth_token^Twilio Auth Token.",
                "twilio_number^Twilio number.",
                "twilio_sid^Twilio SID."
            ];
            setRequirements(requiredFields.filter((key) => !settings.get(key.split("^")[0])));
        })();
    }, [refresh])

    return (
        <>
            {(requirements && requirements.length) ? (
                <div className={styles.todo} onClick={() => toaster.push(
                    <ConfirmModal title={"Action Items Needed"} hideCancel={true}>
                        <p><FontAwesomeIcon icon={faExclamationTriangle} color={"yellow"}/> Warning:
                            Please complete all listed requirements to finish setup.
                            <br/><br/>
                            <ul>
                                {requirements.map((key) => <li key={key}>{key.split("^")[1]}</li>)}
                            </ul>
                        </p>
                    </ConfirmModal>
                )}>
                    Action Needed
                </div>
            ) : <></>}
        </>
    )
}