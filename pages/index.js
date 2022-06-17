import styles from '../styles/Booking.module.css'
import PersonalInformation from "../components/BookingStages/PersonalInformation/PersonalInformation";
import React, {useEffect, useState} from "react";
import SelectServices from "../components/BookingStages/SelectServices/SelectServices";
import axios from "axios";
import Head from "next/head";
import {Steps} from "rsuite";
import SelectProvider from "../components/BookingStages/SelectProvider/SelectProvider";
import SelectDate from "../components/BookingStages/SelectDate/SelectDate";
import BillingInformation from "../components/BookingStages/BillingInformation/BillingInformation";
import BookingConfirmation from "../components/BookingStages/BookingConfirmation/BookingConfirmation";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck} from "@fortawesome/free-solid-svg-icons";
import Script from "next/script";

function Home() {

    const [setupData, setSetupData] = useState(null);
    const [formValues, setFormValues] = useState({});
    const [step, setStep] = useState(1);
    const [stepsCompleted, setStepsCompleted] = useState(1);

    useEffect(() => {
        if (!setupData) {
            (async () => {
                const res = await axios.get('/api/booking/setup-data');
                setSetupData(res.data);
            })();
        }

        if (typeof document !== 'undefined') {
            if (!window.clover) {
                const t = setInterval(() => {
                    try {
                        window.clover = new Clover('dcbd11f4c0a4e6d56b9adbfb71be863c');
                        clearInterval(t)
                    } catch (error) {
                    }
                }, 500);
            }
        }
    }, [])

    function setupClover() {

    }

    const appendFormValues = (values) => {
        // if animating do nothing
        if (document.getElementById("booking-container").querySelector("FORM").classList.contains("fadeAway")) return;

        setFormValues({...formValues, ...values});

        document.getElementById("booking-container").querySelector("FORM").classList.add("fadeAway");

        setTimeout(() => {
            setStep((prevStep) => {
                if (prevStep + 1 > stepsCompleted) {
                    setStepsCompleted(prevStep + 1);
                }
                return prevStep + 1;
            });
        }, 500);
    }

    const PROPS = {
        formValues, setFormValues, appendFormValues, setupData
    }

    const steps = [
        {
            component: <PersonalInformation {...PROPS} />,
            title: "Personal Information"
        },
        {
            component: <SelectServices {...PROPS} />,
            title: "Services"
        },
        {
            component: <SelectDate {...PROPS} />,
            title: "Date"
        },
        {
            component: <SelectProvider {...PROPS} />,
            title: "Provider"
        },
        {
            component: <BillingInformation {...PROPS} />,
            title: "Billing Information"
        },
        {
            component: <BookingConfirmation {...PROPS} />,
            title: ["Confirmation ", <FontAwesomeIcon key={Math.random()} icon={faCheck} height={"16px"}/>]
        }
    ]

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

    // if (!setupData) {
    //     return (
    //         <div className={styles.container}>
    //             <h5>Error connecting to database. Please email, call, or use our live chat to reach us.</h5>
    //         </div>
    //     )
    // }

    const changeStep = (step) => {
        // if animating do nothing
        if (document.getElementById("booking-container").querySelector("FORM").classList.contains("fadeAway")) return;

        if (step > stepsCompleted) {
            return;
        }

        if (formValues?.lead?.selectedStaff || formValues?.lead?.selectedTimeSlot) {
            delete formValues["lead"]["selectedStaff"];
            delete formValues["lead"]["selectedTimeSlot"];
            setFormValues(formValues);
        }

        document.getElementById("booking-container").querySelector("FORM").classList.add("fadeAway");

        setTimeout(() => {
            setStep(step);
        }, 500);
    }

    return (
        <>
            <Head>
                <title>FullSchedule</title>
                <link rel="preconnect" href="https://fonts.googleapis.com"/>
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true"/>
                {setupData?.booking_settings?.font &&
                    <link
                        href={`https://fonts.googleapis.com/css2?family=${setupData.booking_settings.font.split(' ').join('+')}&display=swap`}
                        rel="stylesheet"/>}
            </Head>
            <Script src="https://checkout.clover.com/sdk.js"/>
            <div className={styles.container} id={"booking-container"}>
                <Steps className={styles.desktopSteps + (step === steps.length ? " fadeAway" : "")} current={step - 1}
                       vertical style={{
                    width: '200px',
                    display: 'inline-table',
                    verticalAlign: 'top',
                    position: 'fixed',
                    left: '10vw'
                }}>
                    {steps.map((step, index) => <Steps.Item key={step.title} title={[<label key={Math.random()}
                                                                                            style={index + 1 > stepsCompleted ? {cursor: 'not-allowed'} : {cursor: 'pointer'}}
                                                                                            onClick={() => changeStep(index + 1)}>{step.title}</label>]}
                                                            description={[<button key={Math.random()}
                                                                                  style={index + 1 > stepsCompleted ? {cursor: 'not-allowed'} : {}}
                                                                                  onClick={() => changeStep(index + 1)}/>]}/>)}
                </Steps>

                <Steps className={styles.mobileSteps + (step === steps.length ? " fadeAway" : "")} current={step - 1}
                       small style={{
                    position: 'fixed',
                }}>
                    {steps.map((step, index) => <Steps.Item key={step.title}
                                                            description={[<button key={Math.random()}
                                                                                  onClick={() => changeStep(index + 1)}/>]}/>)}
                </Steps>

                {steps[step - 1].component}
            </div>
        </>
    )
}

// export async function getServerSideProps({req}) {
//     const protocol = req.headers['x-forwarded-proto'] || 'http'
//     const baseUrl = req ? `${protocol}://${req.headers.host}` : ''
//
//     const res = await axios.get(baseUrl + '/api/booking/setup-data')
//     // Pass data to the page via props
//     return {props: {setupData: res.data}}
// }

export default Home;
