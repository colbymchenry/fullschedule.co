import styles from './styles.module.css'
import React, {useState} from "react";
import {Form, Notification, Schema, toaster} from "rsuite";
import axios from "axios";
import IFrameApp from "../../IFrameApp/IFrameApp";

export default function BillingInformation(props) {

    const [submitted, setSubmitted] = useState(false);

    const processPayment = async (data) => {

        if (submitted) return;

        setSubmitted(true)
        try {
            const leadUpdate = await axios.post(`/api/booking/update-lead?id=${props.formValues.lead.doc_id}`, { clover_source: data.token });
            props.appendFormValues(leadUpdate.data)
        } catch (err) {
            console.error(err)

            if (err?.response?.status === 401) {
                // setError(true)
            }

            toaster.push(<Notification type={"error"}
                                       header={"Error connecting to database. Please email, call, or use our live chat to reach us."}/>, {
                placement: 'topEnd'
            });

            setSubmitted(false)
        }
    }

    const submitForm = async () => {
        setSubmitted(true);

        setSubmitted(false);
    }

    return (
        <div className={styles.calendarContainer}>
            {!window.clover ?
                <IFrameApp
                    outputHandler={(data) => []}
                    callback={(data) => processPayment(data)}
                    backHandler={() => []}
                    amount={`1`}
                    processing={submitted}
                    label={"Secure Appointment"}
                    btnStyle={{backgroundColor: "#0051ff", color: "white", padding: '0.5rem 0'}}
                    noBlack={true}
                    info={"* 100% goes towards cost of appointment"}
                />
                :
                <h5 style={{ textAlign: 'center' }}>Error loading payment processor.<br /><br />Please call us to schedule an appointment.</h5>
            }

            {/*{error && <span style={{ color: 'darkred', marginTop: '1rem' }}><b>Payment failed.</b></span>}*/}
        </div>
    )

}
