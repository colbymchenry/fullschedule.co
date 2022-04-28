import styles from './styles.module.css';
import {Button, Form, Input, InputGroup, Modal, Notification, Schema, toaster} from "rsuite";
import React, {useRef, useState} from "react";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faSearch} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import {useAuth} from "../../../context/AuthContext";
import {APIConnector} from "../../APIConnector";
import {MaskedInput} from "../../inputs/MaskedInput";
import {Field} from "../../inputs/Field";

const Textarea = React.forwardRef((props, ref) => <Input {...props} as="textarea" ref={ref}/>);

Textarea.displayName = "Textarea";

const CustomInputGroupWidthButton = ({placeholder, ...props}) => (
    <InputGroup {...props} inside style={styles}>
        <Input placeholder={placeholder}/>
        <InputGroup.Button>
            <FontAwesomeIcon icon={faSearch}/>
        </InputGroup.Button>
    </InputGroup>
);

export default function NewTextModal(props) {

    const [open, setOpen] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [formValue, setFormValue] = useState({});
    const [formError, setFormError] = useState({});
    const submitRef = useRef();
    const { currentUser } = useAuth();

    const {StringType} = Schema.Types;

    const model = Schema.Model({
        phone: StringType().isRequired('This field is required.').minLength(12),
        message: StringType().isRequired('This field is required.')
    });

    const handleClose = () => {
        setOpen(false);
    }

    const submitForm = async (passed) => {
        if (!passed) return;

        try {
            await (await APIConnector.create(2000, currentUser)).post(`/sms/send`, formValue);
            toaster.push(<Notification type={"success"} header={"Text sent!"}/>, {
                placement: 'topEnd'
            });
            handleClose();
        } catch (error) {
            console.error(error);
            toaster.push(<Notification type={"error"} header={"Failed to send text."}/>, {
                placement: 'topEnd'
            });
            setSubmitted(false);
        }
    }

    return (
        <Modal open={open} onClose={handleClose}>
            <Modal.Header>
                <Modal.Title>New Text Message</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form className={styles.form} formValue={formValue} onSubmit={submitForm} onChange={formValue => {
                    setFormValue(formValue);
                    if (Object.keys(formError).length) setFormError({});
                }} model={model} disabled={submitted} readOnly={submitted}>
                    <CustomInputGroupWidthButton size={"lg"} placeholder={"Search Client"}/>
                    <br/>
                    <Field
                        name="phone"
                        label="Phone"
                        message={"Required"}
                        type={"tel"}
                        mask={"999-999-9999"}
                        maskChar={""}
                        accepter={MaskedInput}
                        error={formError["phone"]}
                    />
                    <Field
                        name="message"
                        label="Message"
                        message={"Required"}
                        accepter={Textarea}
                        error={formError["message"]}
                    />
                    <button ref={submitRef} type={"submit"} style={{ display: 'none' }} />
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => submitRef.current.click()} appearance="primary" loading={submitted}>
                    Send
                </Button>
                <Button onClick={handleClose} appearance="subtle">
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    )

}