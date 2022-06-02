import styles from './styles.module.css'
import React, {useState} from "react";
import {Button, Form, Notification, Schema, toaster} from "rsuite";
import {MaskedInput} from "../../inputs/MaskedInput";
import {Field} from "../../inputs/Field";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from "firebase/auth";
import {APIConnector} from "../../APIConnector";
import {FirebaseClient} from "../../../utils/firebase/FirebaseClient";

const {StringType} = Schema.Types;

export default function PersonalInformation(props) {

    const [formValue, setFormValue] = useState({});
    const [formError, setFormError] = useState({});
    const [triggerRender, setTriggerRender] = useState(false);
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
            });
    };

    const signInWithFacebook = () => {
        signInWithPopup(FirebaseClient.auth(), facebookProvider)
            .then((result) => {
                console.log(result);
                // if (result?.user?.displayName) {
                //     formValue["name"] = result.user.displayName;
                // }
                // if (result?.user?.email) {
                //     formValue["email"] = result.user.email;
                // }
                //
                // setFormValue(formValue);
                // setTriggerRender(!triggerRender);
            })
            .catch((error) => {
                console.log(error);
            });
    };

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

            <Button appearance="primary" type="button" onClick={signInWithGoogle}>Login with Google</Button>
            <Button appearance="primary" type="button" onClick={signInWithFacebook}>Login with Facebook</Button>

            <Button appearance="primary" type="submit" onClick={() => props.appendFormValues(formValue)} loading={props.submitted}>Next</Button>
        </Form>
    )

}