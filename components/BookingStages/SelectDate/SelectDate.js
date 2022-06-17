import styles from './styles.module.css'
import React, {useEffect, useState} from "react";
import {Button, Calendar, Form, Notification, Schema, toaster} from "rsuite";
import axios from "axios";

export default function SelectDate(props) {

    const [submitted, setSubmitted] = useState(false);
    const [formValue, setFormValue] = useState({ date: null });
    const [triggerRender, setTriggerRender] = useState(false);
    const today = new Date();
    today.setDate(today.getDate() + 2);

    useEffect(() => {
        if (props?.formValues?.lead?.date) {
            formValue["date"] = props?.formValues?.lead?.date;
            setFormValue(formValue);
            setTriggerRender(!triggerRender);
        }
    }, [])

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

    function renderCell(date) {
        if (date <= today) {
            return <div className={styles.badDate}>{" "}</div>
        }

        return null;
    }

    const date = props?.formValues?.lead?.date ? new Date(props?.formValues?.lead?.date) : undefined;

    return (
        <Form formValue={formValue} disabled={props.submitted} readOnly={props.submitted} >
            <div className={styles.calendarContainer}>
                <Calendar compact bordered renderCell={renderCell} defaultValue={date} onChange={(date) => {
                    if (date > today) {
                        setFormValue({date});
                    } else {
                        setFormValue({ date: null })
                    }
                }} />
            </div>
            <div style={{ marginTop: "4rem" }} className={styles.nextBtn}>
                <Button appearance="primary" type="submit" onClick={submitForm} loading={submitted} disabled={formValue.date === null}>Next</Button>
            </div>
        </Form>
    )

}
