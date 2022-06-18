import styles from './styles.module.css';
import {Form, Notification, Schema, toaster} from "rsuite";
import {Field} from "../../inputs/Field";
import {MaskedInput} from "../../inputs/MaskedInput";
import React, {useRef, useState} from "react";
import {APIConnector} from "../../APIConnector";
import {useAuth} from "../../../context/AuthContext";
import ConfirmModal from "../../modals/ConfirmModal/ConfirmModal";

const {StringType} = Schema.Types;

export default function AppointmentModify(props) {

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

            handleClose();
        } catch (error) {
            if (error?.response?.data?.code === 'auth/email-already-exists') {
                formError["email"] = error?.response?.data.message;
            } else if (error?.response?.data?.code === 'auth/invalid-password') {
                formError["password"] = error?.response?.data.message;
            } else {
                toaster.push(<Notification type={"error"} header={"Failed to create product."}/>, {
                    placement: 'topEnd'
                });
                console.error(error);
            }

            setFormError(formError);
            setSubmitted(false);
        }
    }

    return (
        <ConfirmModal open={open} title={"New Product"} confirmText={"Create"} onConfirm={() => submitForm(true)}>
            <Form className={styles.form} formValue={formValue} onChange={formValue => {
                setFormValue(formValue);
                if (Object.keys(formError).length) setFormError({});
            }} model={model} disabled={submitted} readOnly={submitted}>
                <div className={styles.section}>

                </div>
                <button ref={submitRef} type={"submit"} style={{display: 'none'}}/>
            </Form>
        </ConfirmModal>
    )

}