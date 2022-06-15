import styles from './styles.module.css'
import mainStyles from '../styles.module.css'
import React, {forwardRef, useState} from "react";
import {Button, Checkbox, Form, Notification, Radio, Schema, toaster, Animation, Calendar} from "rsuite";
import {Field} from "../../inputs/Field";
import axios from "axios";
import IFrameApp from "../../IFrameApp/IFrameApp";

const {StringType} = Schema.Types;

export default function BillingInformation(props) {

    const [submitted, setSubmitted] = useState(false);
    const [formValue, setFormValue] = useState({ date: null });
    const [processing, setProcessing] = useState(false);

    const processPayment = async (data) => {

        if (processing) return;

        setProcessing(true)
        try {

                // clover_info: {
                //     source: data.token
                // }


        } catch (err) {
            console.error(err)

            if (err?.response?.status === 401) {
                // setError(true)
            }

            setProcessing(false)
        }
    }

    const submitForm = async () => {
        setSubmitted(true);
        try {
            const leadUpdate = await axios.post(`/api/booking/update-lead?id=${props.formValues.lead.doc_id}`, formValue);
            props.appendFormValues(leadUpdate.data)
        } catch (error) {
            toaster.push(<Notification type={"error"}
                                       header={"Error connecting to database. Please email, call, or use our live chat to reach us."}/>, {
                placement: 'topEnd'
            });
        }
        setSubmitted(false);
    }

    return (
        <Form formValue={formValue} disabled={props.submitted} readOnly={props.submitted} >
            <div className={styles.calendarContainer}>
                {window.clover &&
                    <IFrameApp
                        outputHandler={(data) => []}
                        callback={(data) => processPayment(data)}
                        backHandler={() => []}
                        amount={`1`}
                        processing={processing}
                        label={"Secure Appointment"}
                        btnStyle={{ backgroundColor: "#0051ff", color: "white", padding: '0.5rem 0' }}
                        noBlack={true}
                        info={"* 100% goes towards cost of appointment"}
                    />
                }

                {/*{error && <span style={{ color: 'darkred', marginTop: '1rem' }}><b>Payment failed.</b></span>}*/}
            </div>
        </Form>
    )

}
