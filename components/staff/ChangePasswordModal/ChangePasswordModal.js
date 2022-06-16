import React, {useEffect, useRef, useState} from "react";
import styles from "./styles.module.css";
import {Button, Form, Modal, Notification, Schema, toaster} from "rsuite";
import {APIConnector} from "../../APIConnector";
import {useAuth} from "../../../context/AuthContext";
import {InputPassword} from "../../inputs/InputPassword";
import {Field} from "../../inputs/Field";

const {StringType} = Schema.Types;

export default function ChangePasswordModal(props) {

    const [visible, setVisible] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [formValue, setFormValue] = useState({});
    const [formError, setFormError] = useState({});
    const [triggerRender, setTriggerRender] = useState(false);
    const submitRef = useRef();
    const { currentUser } = useAuth();

    const changePassword = async (passed) => {
        if (!passed) return;

        if (formValue["password"] !== formValue["password_confirmation"]) {
            formError["password_confirmation"] = "Passwords do not match.";
            setFormError(formError);
            setTriggerRender(!triggerRender);
            return;
        }

        setSubmitted(true);
        try {
            await (await APIConnector.create(2000, currentUser)).post("/staff/change-password", {...formValue, uid: props.staff.uid });
            toaster.push(<Notification type={"success"} header={"Password updated!"}/>, {
                placement: 'topEnd'
            });
            setVisible(false);
        } catch (error) {
            if (error?.response?.data?.code === 'auth/invalid-password') {
                formError["password"] = error?.response?.data.message;
            } else {
                toaster.push(<Notification type={"error"} header={"Failed to create staff account."}/>, {
                    placement: 'topEnd'
                });
                console.error(error);
            }

            setFormError(formError);
            setSubmitted(false);
        }
    }

    const model = Schema.Model({
        password: StringType().isRequired('This field is required.'),
        password_confirmation: StringType().isRequired('This field is required.')
    });

    useEffect(() => {

    }, [formError])

    return (

        <Modal open={visible} onClose={() => setVisible(false)} backdrop={"static"}>
            <Modal.Header>
                <Modal.Title>Change Password</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>You are changing <b>{props.staff.firstname} {props.staff.lastname}&apos;s</b> password.</p>
                <Form className={styles.form} formValue={formValue} onSubmit={changePassword} onChange={formValue => {
                    setFormValue(formValue);
                    if (Object.keys(formError).length) setFormError({});
                }} model={model} disabled={submitted} readOnly={submitted}>
                    <Field
                        name="password"
                        label="Password"
                        accepter={InputPassword}
                        error={formError["password"]}
                    />
                    <Field
                        name="password_confirmation"
                        label="Password Confirmation"
                        accepter={InputPassword}
                        error={formError["password_confirmation"]}
                    />
                    <button ref={submitRef} type={"submit"} style={{ display: 'none' }} />
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => submitRef.current.click()} appearance="primary" loading={submitted}>
                    Submit
                </Button>
                <Button onClick={() => setVisible(false)} appearance="subtle">
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    )

}