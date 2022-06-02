import styles from './styles.module.css'
import React, {useEffect, useState} from "react";
import {Button, Form, Notification, Schema, toaster} from "rsuite";
import {MaskedInput} from "../../inputs/MaskedInput";
import {Field} from "../../inputs/Field";
import {APIConnector} from "../../APIConnector";
import {FacebookSVG, GoogleSVG} from "../../SVG";
import axios from "axios";

const {StringType} = Schema.Types;

export default function SelectServices(props) {

    const [formValue, setFormValue] = useState({});
    const [formError, setFormError] = useState({});
    const [submitted, setSubmitted] = useState(false);

    const submitForm = async () => {
        setSubmitted(true);
        try {
            const leadCreate = await axios.post("/api/booking/create-lead", formValue);
            props.appendFormValues(leadCreate.data)
        } catch (error) {
            toaster.push(<Notification type={"error"} header={"Error connecting to database. Please email, call, or use our live chat to reach us."}/>, {
                placement: 'topEnd'
            });
        }
        setSubmitted(false);
    }

    return (
        <Form formValue={formValue} onChange={formValue => {
            setFormValue(formValue);
            if (Object.keys(formError).length) setFormError({});
        }} disabled={props.submitted} readOnly={props.submitted}>
            <Field
                name="name"
                label="Full Name"
                type={"text"}
                accepter={MaskedInput}
                error={formError["name"]}
            />

            <div className={styles.loginButtons}>
                <Button appearance="primary" type="submit" onClick={submitForm} loading={props.submitted}>Next</Button>
            </div>
        </Form>
    )

}