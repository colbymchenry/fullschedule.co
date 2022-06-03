import styles from './styles.module.css'
import mainStyles from '../styles.module.css'
import React, {useState} from "react";
import {Button, Checkbox, Form, Notification, Radio, Schema, toaster} from "rsuite";
import {Field} from "../../inputs/Field";
import axios from "axios";

const {StringType} = Schema.Types;

export default function SelectServices(props) {

    const [formValue, setFormValue] = useState({ services: [] });
    const [formError, setFormError] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [triggerRender, setTriggerRender] = useState(false);

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
        <Form formValue={formValue} disabled={props.submitted} readOnly={props.submitted}>
            {props.setupData.services.map((service) => {
                return (
                    <Field
                        onChange={(value, checked) => {
                            if (checked) {
                                formValue["services"].push(service);
                                setFormValue(formValue)
                            } else {
                                const newFormValue = formValue["services"].filter((serviceObj) => serviceObj.id !== service.id);
                                setFormValue({ "services": newFormValue })
                            }

                            setTriggerRender(!triggerRender);
                        }}
                        key={service.id}
                        className={styles.serviceSelection}
                        name={service.id}
                        value={service.id}
                        label={service.name}
                        accepter={Checkbox}
                        error={formError["name"]}
                    />
                )
            })}


            <div>
                <Button appearance="primary" type="submit" onClick={submitForm} loading={props.submitted}>Next</Button>
            </div>
        </Form>
    )

}