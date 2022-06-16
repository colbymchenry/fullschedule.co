import styles from './styles.module.css'
import React, {useState} from "react";
import {Notification, toaster} from "rsuite";
import axios from "axios";
import IFrameApp from "../../IFrameApp/IFrameApp";

export default function BillingInformation(props) {

    const [submitted, setSubmitted] = useState(false);

    const processPayment = async (data) => {

        if (submitted) return;

        setSubmitted(true)
        try {
            const leadUpdate = await axios.post(`/api/booking/update-lead?id=${props.formValues.lead.doc_id}`, {clover_source: data.token});
            const createBooking = await axios.post(`/api/booking/create-booking?id=${props.formValues.lead.doc_id}`, props.formValues.lead);
            props.appendFormValues({ ...leadUpdate.data, booking: createBooking.data })
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

    return (
        <div className={styles.calendarContainer}>
            {window.clover ?
                <IFrameApp
                    outputHandler={(data) => []}
                    callback={(data) => processPayment(data)}
                    backHandler={() => []}
                    amount={`0`}
                    processing={submitted}
                    label={"Secure Appointment"}
                    btnStyle={{backgroundColor: "#0051ff", color: "white", padding: '0.5rem 0'}}
                    noBlack={true}
                    info={"* Please stay in touch! If you do not modify or cancel 24 hours in advance of your appointment we will charge a $75 no show fee."}
                />
                :
                <h5 style={{textAlign: 'center'}}>Error loading payment
                    processor.<br/><br/>Please {props?.setupData?.phone ?
                        <a href={`tel:${props.setupData.phone.replace(/-/g, '')}`}>call us</a> : "call us"} to schedule
                    an appointment.</h5>
            }

            {/*{error && <span style={{ color: 'darkred', marginTop: '1rem' }}><b>Payment failed.</b></span>}*/}
        </div>
    )

}
