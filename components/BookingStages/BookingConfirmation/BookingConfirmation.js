import styles from './styles.module.css'
import React, {useState} from "react";
import {Form, Tag} from "rsuite";
import useWindowSize from 'react-use/lib/useWindowSize';
import Confetti from 'react-confetti';

export default function BookingConfirmation(props) {

    const {width, height} = useWindowSize()
    const [formValue, setFormValue] = useState({});

    console.log(props)

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

    return (
        <>
            <Form formValue={formValue} disabled={props.submitted} readOnly={props.submitted} className={styles.form}>
                <div className={styles.container}>
                    <h5 style={{ fontSize: "1.2rem" }}><b>Booking Details</b></h5>
                    <div className={styles.divider}>{" "}</div>
                    <section>
                        <label>Location</label>
                        <h5><b>Athens</b></h5>
                        <p style={{ overflowX: "auto", whiteSpace: "nowrap" }}>3372 Peachtree Rd NE, Unit 2302, Atlanta, GA 30326</p>
                    </section>
                    <section>
                        <label>Date & Time</label>
                        <span>{startTime} {dayOfWeek.substring(0, 3)}, {startDate}</span>
                    </section>
                    <section>
                        <label>Booked for</label>
                        <Tag color="blue">{staff.firstname} {staff.lastname}</Tag>
                    </section>
                    <section>
                        <label>Packages / Services Added</label>
                        {services.map((service) => <span>{service}</span>)}
                    </section>
                    {/*<h4>Your booking is confirmed!</h4>*/}
                    {/*<br />*/}
                    {/*<br />*/}
                    {/*<p>Your appointment with <b>{staff.firstname} {staff.lastname}</b> is schedule on <b>{startTime}</b> and is expected to end at <b>{endTime}</b>.</p>*/}
                </div>
                <div style={{marginTop: "4rem"}}>
                </div>
            </Form>
            <Confetti
                recycle={false}
                width={width}
                height={height}
            />
        </>
    )

}
