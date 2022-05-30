import styles from './styles.module.css';
import ConfirmModal from "../ConfirmModal/ConfirmModal";
import {Form, Loader, Message, Notification, Schema, toaster, Uploader} from "rsuite";
import {previewFile} from "rsuite/utils";
import {AvatarSVG} from "../../SVG";
import {Field} from "../../inputs/Field";
import {MaskedInput} from "../../inputs/MaskedInput";
import React, {useRef, useState} from "react";
import {APIConnector} from "../../APIConnector";
import {useAuth} from "../../../context/AuthContext";

const {StringType} = Schema.Types;

export default function NewProductModal(props) {

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
        props.fetchInventory();
    }

    const submitForm = async (passed) => {
        if (!passed) return false;

        setSubmitted(true);
        try {
            const createRes = await (await APIConnector.create(6000, currentUser)).post(`/clover/create-product`, formValue);
            toaster.push(<Notification type={"success"} header={"Product created!"}/>, {
                placement: 'topEnd'
            });
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
                    <Field
                        name="name"
                        label="Name"
                        message={"Required"}
                        accepter={MaskedInput}
                        error={formError["name"]}
                    />

                    <Field
                        name="price"
                        label="Price"
                        message={"Required"}
                        accepter={MaskedInput}
                        pattern="[0-9]{1,5}"
                        type={"tel"}
                        error={formError["price"]}
                    />
                </div>
                <button ref={submitRef} type={"submit"} style={{display: 'none'}}/>
            </Form>
        </ConfirmModal>
    )

}