import styles from './styles.module.css';
import ConfirmModal from "../ConfirmModal/ConfirmModal";
import {DatePicker, Form, Notification, Schema, toaster} from "rsuite";
import {Field} from "../../inputs/Field";
import {MaskedInput} from "../../inputs/MaskedInput";
import React, {useRef, useState} from "react";
import {APIConnector} from "../../APIConnector";
import {useAuth} from "../../../context/AuthContext";

const {StringType} = Schema.Types;

export default function NewCustomerModal(props) {

    const [open, setOpen] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [formValue, setFormValue] = useState({});
    const [formError, setFormError] = useState({});
    const submitRef = useRef();
    const { currentUser } = useAuth();

    const model = Schema.Model({
        ...(!props.staff && {password: StringType().isRequired('This field is required.')}),
        email: StringType()
            .isEmail('Please enter a valid email address.')
            .isRequired('This field is required.'),
        firstname: StringType().isRequired('This field is required.'),
        lastname: StringType().isRequired('This field is required.')
    });

    const handleClose = () => {
        setOpen(false);
    }

    const submitForm = async (passed) => {
        if (!passed) return false;

        setSubmitted(true);
        try {
            const createRes = await (await APIConnector.create(6000, currentUser)).post(`/clover/create-customer`, formValue);
            toaster.push(<Notification type={"success"} header={"Customer created!"}/>, {
                placement: 'topEnd'
            });

            if (props.fetchCustomers) {
                await props.fetchCustomers();
            }

            handleClose();
        } catch (error) {
            if (error.response.status === 400) {
                setFormError(error.response.data);
            } else {
                toaster.push(<Notification type={"error"} header={"Failed to create product."}/>, {
                    placement: 'topEnd'
                });
                console.error(error);
            }

            setSubmitted(false);
        }
    }

    return (
        <ConfirmModal open={open} handleClose={handleClose} title={"New Customer"} confirmText={"Create"} onConfirm={() => submitForm(true)}>
            <Form className={styles.form} formValue={formValue} onChange={formValue => {
                setFormValue(formValue);
                if (Object.keys(formError).length) setFormError({});
            }} model={model} disabled={submitted} readOnly={submitted}>
                <div className={styles.section}>
                    <Field
                        name="firstName"
                        label="First Name"
                        message={"Required"}
                        accepter={MaskedInput}
                        error={formError["firstName"]}
                        required
                    />

                    <Field
                        name="lastName"
                        label="Last Name"
                        message={"Required"}
                        accepter={MaskedInput}
                        error={formError["lastName"]}
                        required
                    />
                </div>
                <div className={styles.section}>
                    <Field
                        name="email"
                        label="Email"
                        message={"Required"}
                        accepter={MaskedInput}
                        error={formError["email"]}
                        required
                    />

                    <Field
                        name="phoneNumber"
                        label="Phone"
                        type={"tel"}
                        mask={"999-999-9999"}
                        maskChar={""}
                        accepter={MaskedInput}
                        error={formError["phoneNumber"]}
                        required
                    />
                </div>

                <div className={styles.section}>
                    <Field
                        name="dob"
                        label="Date of Birth"
                        message={"Required"}
                        accepter={DatePicker}
                        error={formError["dob"]}
                    />

                </div>
                <button ref={submitRef} type={"submit"} style={{display: 'none'}}/>
            </Form>
        </ConfirmModal>
    )

}