import React, {useEffect, useState} from "react";
import {Button, Form, InputNumber, Notification, Panel, Schema, SelectPicker, toaster, Toggle} from "rsuite";
import styles from './styles.module.css'
import states from "../../../../public/states.json"
import timezones from "../../../../public/timezones.json"
import {FirebaseClient} from "../../../../utils/firebase/FirebaseClient";
import {MaskedInput} from "../../../../components/inputs/MaskedInput";
import {Field} from "../../../../components/inputs/Field";
import {useAuth} from "../../../../context/AuthContext";
import GoogleLogin from "react-google-login";
import {APIConnector} from "../../../../components/APIConnector";
import GoogleCalendarListModal from "../../../../components/modals/GoogleCalendarListModal/GoogleCalendarListModal";

const {StringType} = Schema.Types;

export const FeatureField = (props) => {
    return (
        <div className={`d-flex justify-content-between align-items-center w-100`}>
            <div className={`d-flex flex-column`}>
                <span><b>{props.title}</b></span>
                <small>{props.hint}</small>
            </div>
            {props.children}
        </div>
    )
}

export const Header = ({title, label}) => {
    return (
        <div className={`d-flex w-100 flex-column ` + styles.heading}>
            <h4>{title}</h4>
            {label && <small><i>{label}</i></small>}
        </div>
    )
}

export default function DashboardSettings(props) {

    const [submitted, setSubmitted] = useState(false);
    const [formValue, setFormValue] = useState({});
    const [formError, setFormError] = useState({});
    const {currentUser} = useAuth();

    const model = Schema.Model({
        password: StringType().isRequired('This field is required.'),
        email: StringType()
            .isEmail('Please enter a valid email address.')
            .isRequired('This field is required.')
    });

    const submitForm = async () => {
        setSubmitted(true);

        try {
            if (!await FirebaseClient.doc("settings", "main")) {
                await FirebaseClient.set("settings", "main", formValue);
            } else {
                await FirebaseClient.update("settings", "main", formValue);
            }

            toaster.push(<Notification type={"success"} header={"Settings saved!"}/>, {
                placement: 'topEnd'
            });
        } catch (error) {
            console.error(error);
            toaster.push(<Notification type={"error"} header={"Failed to save settings."}/>, {
                placement: 'topEnd'
            });
        }

        setSubmitted(false);
    }

    const googleOauth = async (success, data) => {
        try {
            await (await APIConnector.create(2000, currentUser)).post(`/google/oauth2token`, {
                code: data.code
            });
            toaster.push(<Notification type={"success"} header={"Successfully connected Google account!"}/>, {
                placement: 'topEnd'
            });
            toaster.push(<GoogleCalendarListModal currentUser={currentUser}/>);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        if (!Object.keys(formValue).length) {
            (async () => {
                try {
                    setFormValue(await FirebaseClient.doc("settings", "main"));
                } catch (error) {
                    console.error(error);
                    toaster.push(<Notification type={"error"} header={"Failed to fetch settings."}/>, {
                        placement: 'topEnd'
                    });
                }
            })();
        }
    }, [])

    return (
        <>
            <Form className={styles.form} formValue={formValue} onChange={formValue => {
                setFormValue(formValue);
                if (Object.keys(formError).length) setFormError({});
            }} model={model} disabled={submitted} readOnly={submitted}>

                <div className={styles.section}>
                    <Field
                        name="company_name"
                        label="Company Name"
                        accepter={MaskedInput}
                        error={formError["company_name"]}
                    />
                </div>
                <small>This is used across the site. For SMS and email reminders.</small>

                <br />

                <Header title={"Office Address & Phone Number"}
                        label={"This will be used in emails, SMS messages, and booking process."}/>
                <div className={styles.section}>
                    <Field
                        name="address_street_line1"
                        label="Street Address (Line 1)"
                        accepter={MaskedInput}
                        error={formError["address_street_line1"]}
                    />
                    <Field
                        name="address_street_line2"
                        label="Street Address (Line 2)"
                        accepter={MaskedInput}
                        error={formError["address_street_line2"]}
                    />
                    <Field
                        name="address_state"
                        label="State"
                        accepter={SelectPicker}
                        data={states}
                        error={formError["address_state"]}
                    />
                    <Field
                        name="address_city"
                        label="City"
                        accepter={MaskedInput}
                        error={formError["address_city"]}
                    />
                    <Field
                        name="address_zip"
                        label="Zip Code"
                        mask={"99999"}
                        type={"tel"}
                        maskChar={""}
                        pattern="^\d{5}(?:[-\s]\d{4})?$"
                        accepter={MaskedInput}
                        error={formError["address_city"]}
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
                    <Field
                        name="time_zone"
                        label="Time Zone"
                        accepter={SelectPicker}
                        data={timezones}
                        error={formError["time_zone"]}
                    />
                </div>

                <br/>
                <br/>
                <Header title={"Features"} label={"Enable/Disable portal features."}/>
                <div className={`d-flex flex-column w-100`} style={{gap: '1rem'}}>

                    <FeatureField title={"Google Calendar API"}
                                  hint={"Login with the company's administrative Google account and select the calendar used for Full Schedule."}>

                        {!formValue["google_tokens"] ?
                            <GoogleLogin
                                clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
                                buttonText="Login with Google"
                                onSuccess={(data) => googleOauth(true, data)}
                                onFailure={() => googleOauth(false)}
                                cookiePolicy="single_host_origin"
                                accessType="offline"
                                responseType="code"
                                approvalPrompt="force"
                                prompt='consent'
                                scope={"https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events"}
                                redirectUri={"http://localhost:3000/admin/dashboard/settings"}
                            />
                            : <Button onClick={() => toaster.push(<GoogleCalendarListModal currentUser={currentUser}/>)}>{formValue["google_calendar_id"] ? "Change" : "Select"} Calendar</Button>
                        }
                    </FeatureField>

                    <FeatureField title={"Officer Manager Email"}
                                  hint={"Send an email of new appointments to the office manager."}>
                        <Field
                            name="office_manager_email"
                            type={"email"}
                            accepter={MaskedInput}
                            error={formError["office_manager_email"]}
                        />
                    </FeatureField>

                    <FeatureField title={"Booking Fee"} hint={"Charge a booking fee to protect from no shows."}>
                        <Field
                            name="booking_fee"
                            accepter={MaskedInput}
                            mask={"$9999"}
                            maskChar={""}
                            error={formError["booking_fee"]}
                        />
                    </FeatureField>

                    <FeatureField title={"Restrict Providers"}
                                  hint={"Only allow providers to be booked for authorized services."}>
                        <Field
                            name="restrict_providers"
                            accepter={Toggle}
                            error={formError["restrict_providers"]}
                        />
                    </FeatureField>

                </div>

                <br/>
                <br/>
                <Header title={"Socials"} label={"This will be used in emails, SMS messages, and booking process."}/>
                <div className={styles.section}>
                    <Field
                        name="socials_tiktok"
                        label="TikTok"
                        accepter={MaskedInput}
                        error={formError["socials_tiktok"]}
                    />
                    <Field
                        name="socials_instagram"
                        label="Instagram"
                        accepter={MaskedInput}
                        error={formError["socials_instagram"]}
                    />
                    <Field
                        name="socials_facebook"
                        label="Facebook"
                        accepter={MaskedInput}
                        error={formError["socials_facebook"]}
                    />
                    <Field
                        name="socials_youtube"
                        label="Youtube"
                        accepter={MaskedInput}
                        error={formError["socials_youtube"]}
                    />
                    <Field
                        name="socials_twitter"
                        label="Twitter"
                        accepter={MaskedInput}
                        error={formError["socials_twitter"]}
                    />

                </div>

                <br/>
                <br/>
                <Panel header={[
                    <Header key="head" title={"API Keys"}
                            label={"This is used for third-party implementations. (Have an admin set this up)"}/>
                ]} collapsible>

                    <div className={styles.section}>
                        <h4>Twilio SMS</h4>
                        <Field
                            name="twilio_sid"
                            label="SID"
                            accepter={MaskedInput}
                            error={formError["twilio_sid"]}
                        />
                        <Field
                            name="twilio_auth_token"
                            label="Auth Token"
                            accepter={MaskedInput}
                            error={formError["twilio_auth_token"]}
                        />
                        <Field
                            name="twilio_mg_sid"
                            label="Messaging SID"
                            accepter={MaskedInput}
                            error={formError["twilio_mg_sid"]}
                        />
                        <Field
                            name="twilio_number"
                            label="Number"
                            accepter={MaskedInput}
                            error={formError["twilio_number"]}
                        />
                    </div>
                    <br />
                    <br />
                    <div className={styles.section}>
                        <h4>TextMagic (Automated Text Reminders)</h4>
                        <Field
                            name="text_magic_user"
                            label="Username"
                            accepter={MaskedInput}
                            error={formError["text_magic_user"]}
                        />
                        <Field
                            name="text_magic_api_key"
                            label="API Key"
                            accepter={MaskedInput}
                            error={formError["text_magic_api_key"]}
                        />
                    </div>
                    <br/>
                    <br/>
                    <div className={styles.section}>
                        <h4>E-Mail</h4>
                        <Field
                            name="email_host"
                            label="Host"
                            accepter={MaskedInput}
                            error={formError["email_host"]}
                        />
                        <Field
                            name="email_port"
                            label="Port"
                            type={"number"}
                            accepter={InputNumber}
                            error={formError["email_port"]}
                        />
                        <Field
                            name="email_username"
                            label="Username"
                            accepter={MaskedInput}
                            error={formError["email_username"]}
                        />
                        <Field
                            name="email_password"
                            label="Password"
                            type={"password"}
                            accepter={MaskedInput}
                            error={formError["email_password"]}
                        />
                    </div>
                    <br/>
                    <br/>
                    <div className={styles.section}>
                        <h4>Clover</h4>
                        <Field
                            name="clover_ecomm_private_token"
                            label="Private Token"
                            accepter={MaskedInput}
                            error={formError["clover_ecomm_private_token"]}
                        />
                        <Field
                            name="clover_api_token"
                            label="API-Key"
                            accepter={MaskedInput}
                            error={formError["clover_api_token"]}
                        />
                        <Field
                            name="clover_merchant_id"
                            label="Merchant ID"
                            accepter={MaskedInput}
                            error={formError["clover_merchant_id"]}
                        />
                    </div>
                    <br />
                    <br />
                    <div className={styles.section}>
                        <h4>Facebook Pixel</h4>
                        <Field
                            name="pixel_id"
                            label="Pixel ID"
                            accepter={MaskedInput}
                            error={formError["pixel_id"]}
                        />
                    </div>
                </Panel>
            </Form>
            <Button appearance="primary" onClick={submitForm} loading={submitted}
                    className={'save-button'}>Save</Button>
        </>
    )

}