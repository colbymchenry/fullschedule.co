import axios from "axios";
import React, {useEffect} from "react";
import Head from "next/head";
import styles from "../../styles/Booking.module.css";
import BookingConfirmation from "../../components/BookingStages/BookingConfirmation/BookingConfirmation";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEnvelope, faPhone} from "@fortawesome/free-solid-svg-icons";

export default function Booking({bookingData, leadData, designSettings, setupData}) {

    useEffect(() => {
        if (typeof document !== "undefined" && designSettings) {
            document.getElementsByTagName("HEAD")[0].insertAdjacentHTML("beforeend", `
                <style>
                    body {
                        ${designSettings?.color?.background && `background: ${designSettings.color.background} !important;`}
                    }
                    
                    label,input,button,h1,h2,h3,h4,h5,p,a,small {
                        ${designSettings?.font && `font-family: ${designSettings.font} !important;`}
                    }
                    
                    label,h1,h2,h3,h4,h5,p,a,small {
                        ${designSettings?.color?.foreground && `color: ${designSettings.color.foreground} !important;`}
                    }
                    
                    input {
                        ${designSettings?.color?.input_background && `background: ${designSettings.color.input_background} !important;`}
                        ${designSettings?.color?.input_color && `color: ${designSettings.color.input_color} !important;`}
                    }
                    
                    button[type="submit"] {
                        ${designSettings?.color?.button_background && `background: ${designSettings.color.button_background} !important;`}
                        ${designSettings?.color?.button_color && `color: ${designSettings.color.button_color} !important;`}
                    }
                    
                </style>
            `);
        }
    }, []);


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

            <div className={styles.container} id={"booking-container"}>
                {!bookingData ?
                    <>
                        <p style={{ padding: '5vw' }}><h1>Uh-Oh...</h1><br /><h5>This URL seems to be broken. Please call or email us if you think this is an error.</h5>
                        <div className={styles.callOrEmail}>
                            <a href={`tel:${setupData["phone"]}`}><FontAwesomeIcon icon={faPhone} /></a>
                            <a href={`mailto:${setupData["office_manager_email"]}`}><FontAwesomeIcon icon={faEnvelope} /></a>
                        </div>
                        </p>
                    </>
                    :
                    <BookingConfirmation setupData={setupData} formValues={{
                        lead: leadData,
                        booking: bookingData
                    }}/>
                }
            </div>
        </>
    )
}

export async function getServerSideProps({req, query}) {
    const protocol = req.headers['x-forwarded-proto'] || 'http'
    const baseUrl = req ? `${protocol}://${req.headers.host}` : ''
    const res = await axios.get(baseUrl + `/api/get-booking?id=${query.id}`);
    const res1 = await axios.get(baseUrl + '/api/booking/setup-data');
    const res2 = await axios.get(baseUrl + '/api/booking/design-settings')
    // Pass data to the page via props
    return {
        props: {
            bookingData: res.data.bookingData,
            leadData: res.data.leadData,
            setupData: res1.data,
            designSettings: res2.data.booking_settings
        }
    }
}