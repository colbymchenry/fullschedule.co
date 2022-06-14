import styles from './styles.module.css'
import React, {useState} from "react";
import {Button, Form, Calendar} from "rsuite";

export default function BookingConfirmation(props) {

    const [submitted, setSubmitted] = useState(false);
    const [formValue, setFormValue] = useState({ date: null });

    return (
        <Form formValue={formValue} disabled={props.submitted} readOnly={props.submitted}>
            <div className={styles.calendarContainer}>
                <Calendar compact bordered renderCell={renderCell} onChange={(date) => setFormValue({ date })} />
            </div>
            <div style={{ marginTop: "4rem" }}>
                <Button appearance="primary" type="submit" onClick={submitForm} loading={submitted} disabled={formValue.date === null}>Next</Button>
            </div>
        </Form>
    )

}
