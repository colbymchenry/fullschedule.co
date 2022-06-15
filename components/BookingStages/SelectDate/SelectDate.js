import styles from './styles.module.css'
import mainStyles from '../styles.module.css'
import React, {forwardRef, useState} from "react";
import {Button, Checkbox, Form, Notification, Radio, Schema, toaster, Animation, Calendar} from "rsuite";
import {Field} from "../../inputs/Field";
import axios from "axios";

const {StringType} = Schema.Types;

export default function SelectDate(props) {

    const [submitted, setSubmitted] = useState(false);
    const [formValue, setFormValue] = useState({ date: null });

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
            // return <Badge className="calendar-todo-item-badge" />;

        return null;
    }

    return (
        <Form formValue={formValue} disabled={props.submitted} readOnly={props.submitted} >
            <div className={styles.calendarContainer}>
                <Calendar compact bordered renderCell={renderCell} onChange={(date) => setFormValue({ date })} />
            </div>
            <div style={{ marginTop: "4rem" }} className={styles.nextBtn}>
                <Button appearance="primary" type="submit" onClick={submitForm} loading={submitted} disabled={formValue.date === null}>Next</Button>
            </div>
        </Form>
    )

}
