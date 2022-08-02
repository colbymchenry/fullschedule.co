import React, {useEffect, useState} from "react";
import styles from "./styles.module.css";
import {toaster} from "rsuite";
import ConfirmModal from "../modals/ConfirmModal/ConfirmModal";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faExclamationTriangle} from "@fortawesome/free-solid-svg-icons";
import {useCollectionData} from "react-firebase-hooks/firestore";
import {collection, query, where} from "firebase/firestore";
import {FirebaseClient} from "../../utils/firebase/FirebaseClient";
import {useRouter} from "next/router";

export function ActionItems(props) {

    const [value, loading, error] = useCollectionData(
        query(collection(FirebaseClient.db(), 'settings'), where("doc_id", "==", "main")),
        {
            snapshotListenOptions: { includeMetadataChanges: true },
        }
    );

    const [requirements, setRequirements] = useState([]);
    const router = useRouter();

    useEffect(() => {
        if (value && value.length) {
            (async () => {
                const requiredFields = [
                    "company_name^Set your company name.",
                    "google_tokens^Sign in with Google.",
                    "google_calendar_id^Sign in with Google and select the calendar to be used by Full Schedule.",
                    "phone^Company phone number.",
                    "time_zone^Time zone of location.",
                    "address_city^City address.",
                    "address_state^State address.",
                    "address_street_line1^Street address.",
                    "address_zip^Zip address.",
                    "clover_ecomm_private_token^Set your Clover private token.",
                    "clover_api_token^Set your Clover API-Key.",
                    "clover_merchant_id^Set your Clover Merchant ID.",
                    "clover_app_id^Set your Clover App ID.",
                    "email_host^Email host.",
                    "email_password^Email password.",
                    "email_port^Email port.",
                    "email_username^Email username.",
                    "twilio_auth_token^Twilio Auth Token.",
                    "twilio_number^Twilio number.",
                    "twilio_sid^Twilio SID.",
                    "twilio_mg_sid^Twilio Messaging SID.",
                    "text_magic_api_key^Text Magic API Key.",
                    "text_magic_user^Text Magic username."
                ];
                setRequirements(requiredFields.filter((key) => !value[0][key.split("^")[0]]));

                if (typeof window !== 'undefined') {
                    if (router.pathname !== '/admin/dashboard/settings') {
                        await router.push(`/admin/dashboard/settings?invalid=${requiredFields.filter((key) => !value[0][key.split("^")[0]]).map((key) => key.split("^")[0]).join(",")}`);
                    }
                }
            })();
        }
    }, [value])

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