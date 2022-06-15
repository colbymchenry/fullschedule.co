import styles from '../styles.module.css'
import React, {useEffect, useState} from "react";
import {Button, Form, Notification, Schema, toaster} from "rsuite";
import {MaskedInput} from "../../inputs/MaskedInput";
import {Field} from "../../inputs/Field";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from "firebase/auth";
import {APIConnector} from "../../APIConnector";
import {FirebaseClient} from "../../../utils/firebase/FirebaseClient";
import {FacebookSVG, GoogleSVG} from "../../SVG";
import axios from "axios";

const {StringType} = Schema.Types;

export default function PersonalInformation(props) {

    const [formValue, setFormValue] = useState({});
    const [formError, setFormError] = useState({});
    const [triggerRender, setTriggerRender] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const googleProvider = new GoogleAuthProvider();
    const facebookProvider = new FacebookAuthProvider();

    const model = Schema.Model({
        name: StringType().isRequired('This field is required.'),
        email: StringType()
            .isEmail('Please enter a valid email address.')
            .isRequired('This field is required.'),
        phone: StringType()
            .isRequired('This field is required.')
    });

    useEffect(() => {
        if (props?.formValues?.lead) {
            if (props?.formValues?.lead?.name) formValue["name"] = props?.formValues?.lead?.name;
            if (props?.formValues?.lead?.email) formValue["email"] = props?.formValues?.lead?.email;
            if (props?.formValues?.lead?.phone) formValue["phone"] = props?.formValues?.lead?.phone;
            setFormValue(formValue);
            setTriggerRender(!triggerRender);
        }
    }, []);

    const signInWithGoogle = () => {
        signInWithPopup(FirebaseClient.auth(), googleProvider)
            .then((result) => {
                if (result?.user?.displayName) {
                    formValue["name"] = result.user.displayName;
                }
                if (result?.user?.email) {
                    formValue["email"] = result.user.email;
                }

                setFormValue(formValue);
                setTriggerRender(!triggerRender);
            })
            .catch((error) => {
                console.log(error);
                toaster.push(<Notification type={"error"} header={"Failed to sign in with Google."}/>, {
                    placement: 'topEnd'
                });
            });
    };

    const signInWithFacebook = () => {
        signInWithPopup(FirebaseClient.auth(), facebookProvider)
            .then((result) => {
                if (result?.user?.displayName) {
                    formValue["name"] = result.user.displayName;
                }
                if (result?.user?.email) {
                    formValue["email"] = result.user.email;
                }

                if (result?.user?.phoneNumber) {
                    formValue["phone"] = result.user.phoneNumber;
                }

                setFormValue(formValue);
                setTriggerRender(!triggerRender);
            })
            .catch((error) => {
                console.log(error);
                toaster.push(<Notification type={"error"} header={"Failed to sign in with Facebook."}/>, {
                    placement: 'topEnd'
                });
            });
    };

    const submitForm = async () => {
        setSubmitted(true);
        try {
            const leadCreate = await axios.post("/api/booking/create-lead", formValue);
            props.appendFormValues({ "lead": leadCreate.data })
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

            <div className={styles.loginButtons}>
                <Button appearance="subtle" type="button" onClick={signInWithGoogle}><GoogleSVG />Sign in with Google</Button>
                <Button appearance="subtle" type="button" onClick={signInWithFacebook}><FacebookSVG />Sign in with Facebook</Button>
                <Button appearance="primary" type="submit" onClick={submitForm} loading={submitted} disabled={!(formValue["name"] && formValue["email"] && formValue["phone"])}>Next</Button>
            </div>
        </Form>
    )

}