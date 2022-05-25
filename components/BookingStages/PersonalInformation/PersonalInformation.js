import styles from './styles.module.css'
import React, {useState} from "react";
import {Button, Form, Schema} from "rsuite";
import {MaskedInput} from "../../inputs/MaskedInput";
import {Field} from "../../inputs/Field";

const {StringType} = Schema.Types;

export default function PersonalInformation(props) {

    const [formValue, setFormValue] = useState({});
    const [formError, setFormError] = useState({});

    const model = Schema.Model({
        name: StringType().isRequired('This field is required.'),
        email: StringType()
            .isEmail('Please enter a valid email address.')
            .isRequired('This field is required.'),
        phone: StringType()
            .isRequired('This field is required.')
    });

    return (
        <Form formValue={formValue} onChange={formValue => {
            setFormValue(formValue);
            if (Object.keys(formError).length) setFormError({});
        }} model={model} disabled={props.submitted} readOnly={props.submitted}>
            <Field
                name="name"
                label="Full Name"
                type={"text"}
                accepter={MaskedInput}
                error={formError["name"]}
            />
            <Field
                name="email"
                label={"Email"}
                type={"email"}
                accepter={MaskedInput}
                error={formError["email"]}
            />
            <Field
                name="phone"
                label="Phone"
                type={"tel"}
                mask={"999-999-9999"}
                maskChar={""}
                accepter={MaskedInput}
                error={formError["phone"]}
            />

            <Button appearance="primary" type="submit" onClick={() => props.appendFormValues(formValue)} loading={props.submitted}>Next</Button>
        </Form>
    )

}