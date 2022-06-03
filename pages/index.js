import styles from '../styles/Booking.module.css'
import PersonalInformation from "../components/BookingStages/PersonalInformation/PersonalInformation";
import React, {useEffect, useState} from "react";
import SelectServices from "../components/BookingStages/SelectServices/SelectServices";
import axios from "axios";
import Head from "next/head";
import {Steps} from "rsuite";

function Home({ setupData }) {

    const [formValues, setFormValues] = useState({});
    const [step, setStep] = useState(1);

    const appendFormValues = (values) => {
        setFormValues({...formValues, ...values});
        setStep((prevStep) => prevStep + 1);
    }

    const PROPS = {
        formValues, setFormValues, appendFormValues, setupData
    }

    const renderStage = () => {
        switch (step) {
            case 1:
                return <PersonalInformation {...PROPS} />;
            case 2:
                return <SelectServices {...PROPS} />;
        }
    }

    useEffect(() => {
        if (typeof document !== "undefined" && setupData) {
            document.getElementsByTagName("HEAD")[0].insertAdjacentHTML("beforeend", `
                <style>
                    body {
                        ${setupData?.booking_settings?.color?.background && `background: ${setupData.booking_settings.color.background} !important;`}
                    }
                    
                    label,input,button,h1,h2,h3,h4,h5,p,a,small {
                        ${setupData?.booking_settings?.font && `font-family: ${setupData.booking_settings.font} !important;`}
                    }
                    
                    label,h1,h2,h3,h4,h5,p,a,small {
                        ${setupData?.booking_settings?.color?.foreground && `color: ${setupData.booking_settings.color.foreground} !important;`}
                    }
                    
                    input {
                        ${setupData?.booking_settings?.color?.input_background && `background: ${setupData.booking_settings.color.input_background} !important;`}
                        ${setupData?.booking_settings?.color?.input_color && `color: ${setupData.booking_settings.color.input_color} !important;`}
                    }
                    
                    button[type="submit"] {
                        ${setupData?.booking_settings?.color?.button_background && `background: ${setupData.booking_settings.color.button_background} !important;`}
                        ${setupData?.booking_settings?.color?.button_color && `color: ${setupData.booking_settings.color.button_color} !important;`}
                    }
                    
                </style>
            `);
        }
    }, []);

    if (!setupData) {
        return (
            <div className={styles.container}>
                <h5>Error connecting to database. Please email, call, or use our live chat to reach us.</h5>
            </div>
        )
    }

    return (
        <>
            <Head>
                <title>Test</title>
                <link rel="preconnect" href="https://fonts.googleapis.com"/>
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                {setupData?.booking_settings?.font &&
                    <link href={`https://fonts.googleapis.com/css2?family=${setupData.booking_settings.font.split(' ').join('+')}&display=swap`} rel="stylesheet"/>}
            </Head>
            <div className={styles.container}>
                <Steps current={step - 1} vertical style={{
                    width: '200px',
                    display: 'inline-table',
                    verticalAlign: 'top',
                    position: 'fixed',
                    left: '10vw'
                }}>
                    <Steps.Item title="Personal Information" />
                    <Steps.Item title="Services" />
                    <Steps.Item title="Provider" />
                    <Steps.Item title="Date & Time" />
                    <Steps.Item title="Billing Information" />
                    <Steps.Item title="Completed!" />
                </Steps>

                {renderStage()}
            </div>
        </>
    )
}

export async function getServerSideProps({req}) {
    const protocol = req.headers['x-forwarded-proto'] || 'http'
    const baseUrl = req ? `${protocol}://${req.headers.host}` : ''

    const res = await axios.get(baseUrl + '/api/booking/setup-data')
    // Pass data to the page via props
    return {props: {setupData: res.data}}
}

export default Home;
