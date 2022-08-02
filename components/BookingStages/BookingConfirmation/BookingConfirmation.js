import styles from './styles.module.css'
import React, {useState} from "react";
import {Form, Tag} from "rsuite";
import useWindowSize from 'react-use/lib/useWindowSize';
import Confetti from 'react-confetti';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faApple, faApplePay, faGoogle, faWaze} from "@fortawesome/free-brands-svg-icons";
import {GoogleSVG} from "../../SVG";

export default function BookingConfirmation(props) {

    const {width, height} = useWindowSize()
    const [formValue, setFormValue] = useState({});

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const dayOfWeek = days[new Date(props.formValues.booking.start.dateTime).getDay()];
    let startTime = new Date(props.formValues.booking.start.dateTime).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: props.formValues.booking.start.timeZone
    });

    let startDate = new Date(props.formValues.booking.start.dateTime).toLocaleDateString([], {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: props.formValues.booking.start.timeZone
    }).replace(/,/, "");

    let endTime = new Date(props.formValues.booking.end.dateTime).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: props.formValues.booking.end.timeZone
    });

    const staff = props.formValues.lead.selectedStaff;
    const time = props.formValues.lead.selectedTimeSlot;
    const services = props.formValues.lead.services.map(({name}) => name);
    const date = props.formValues.lead.date;

    let address = props.setupData["address_street_line1"];

    if (props.setupData["address_street_line2"]) {
        address += ", " + props.setupData["address_street_line2"];
    }

    if (props.setupData["address_city"]) {
        address += ", " + props.setupData["address_city"];
    }

    if (props.setupData["address_state"]) {
        address += ", " + props.setupData["address_state"];
    }

    if (props.setupData["address_zip"]) {
        address += " " + props.setupData["address_zip"];
    }

    return (
        <>
            <Form formValue={formValue} disabled={props.submitted} readOnly={props.submitted} className={styles.form}>
                <div className={styles.container}>
                    <h5 style={{fontSize: "1.2rem"}}><b>Booking Details</b></h5>
                    <div className={styles.divider}>{" "}</div>
                    <section>
                        <label>Location</label>
                        <span>{props.setupData["address_city"]}</span>
                        <p style={{
                            overflowX: "auto",
                            whiteSpace: "nowrap"
                        }}>{address}</p>
                        <div className={styles.addToMaps}>
                            <a href={`https://maps.apple.com/?address=${encodeURIComponent(address)}`}
                               className={styles.apple + " rs-btn-subtle rs-btn"} target={"_blank"}
                               rel="noreferrer"><FontAwesomeIcon icon={faApple}/> Apple Maps</a>
                            <a href={`https://www.google.com/maps/place/${encodeURIComponent(address)}`}
                               className={styles.google + " rs-btn-subtle rs-btn"} target={"_blank"}
                               rel="noreferrer"><GoogleSVG/> Google Maps</a>
                            <a href={`https://waze.com/ul?q=${encodeURIComponent(address)}`}
                               className={styles.waze + " rs-btn-subtle rs-btn"} target={"_blank"}
                               rel="noreferrer"><FontAwesomeIcon icon={faWaze}/> Waze</a>
                        </div>
                    </section>
                    <section>
                        <label>Date & Time</label>
                        <span>{startTime} to {endTime} {dayOfWeek.substring(0, 3)}, {startDate}</span>
                    </section>
                    <section>
                        <label>Provider</label>
                        <Tag color="blue">{staff.firstname} {staff.lastname}</Tag>
                    </section>
                    <section>
                        <label>Packages / Services</label>
                        {services.map((service) => <span key={Math.random()}>{service}</span>)}
                    </section>
                </div>
                <div style={{marginTop: "4rem"}}>
                </div>
            </Form>
            {props.confetti ?
                <Confetti
                    recycle={false}
                    width={width}
                    height={height}
                />
                : <></>}
        </>
    )

}
