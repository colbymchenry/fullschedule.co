import styles from './styles.module.css';
import {Button, ButtonToolbar, Form, Input, Schema} from "rsuite";
import {useAuth} from "../../context/AuthContext";
import {useEffect, useState} from "react";
import {useRouter} from "next/router";
const { StringType } = Schema.Types;

/*
* Admin login page, only a login form included.
* */
export default function AdminLogin(props) {

    const [submitted, setSubmitted] = useState(false);
    const [formValue, setFormValue] = useState({});
    const [formError, setFormError] = useState({});
    const router = useRouter();
    const { login, currentUser } = useAuth();

    const model = Schema.Model({
        password: StringType().isRequired('This field is required.'),
        email: StringType()
            .isEmail('Please enter a valid email address.')
            .isRequired('This field is required.')
    });

    const submitForm = async () => {
        setSubmitted(true);

        try {
            await login(formValue['email'], formValue['password']);
            await router.push('/admin/dashboard');
        } catch(e) {
            if (e?.code === 'auth/user-not-found') {
                formError['email'] = "User not found.";
            } else if (e?.code === 'auth/wrong-password') {
                formError['password'] = "Wrong password."
            }

            setFormError(formError);
        }

        setSubmitted(false);
    }

    // If client is logged in go ahead and redirect to the dashboard
    useEffect(() => {
        if (currentUser) {
            router.push('/admin/dashboard');
        }
    }, [])

    return (
        <>
            <h1 className={styles.header}>Full Schedule</h1>
            <div className={styles.container}>
                <Form onChange={formValue => {
                    setFormValue(formValue);
                    if (Object.keys(formError).length) setFormError({});
                }} model={model} disabled={submitted} readOnly={submitted} onSubmit={submitForm}>
                    <Form.Group controlId="email">
                        <Form.ControlLabel>Email</Form.ControlLabel>
                        {formError['email'] ? <Form.Control name="email" type="email" errorMessage={formError.email}  /> : <Form.Control name="email" type="email"  /> }
                        <Form.HelpText tooltip>Email is required</Form.HelpText>
                    </Form.Group>
                    <Form.Group controlId="password">
                        <Form.ControlLabel>Password</Form.ControlLabel>
                        {formError['password'] ? <Form.Control name="password" type="password" autoComplete="off" errorMessage={formError.password}  /> : <Form.Control name="password" type="password" autoComplete="off"  /> }
                    </Form.Group>
                    <Form.Group>
                        <ButtonToolbar>
                            <Button appearance="primary" loading={submitted} type={"submit"}>Login</Button>
                        </ButtonToolbar>
                    </Form.Group>
                </Form>
            </div>
        </>
    )

}

