import React, {forwardRef, useEffect, useState} from 'react';
import {APIConnector} from "../../../components/APIConnector";
import {AuthProvider, useAuth} from "../../../context/AuthContext";
import styles from "./styles.module.css";
import {Button, DatePicker, Loader, Tag, toaster, Whisper} from "rsuite";
import {
    faCheckCircle,
    faChevronLeft,
    faChevronRight,
    faCog,
    faEllipsis,
    faExclamationTriangle
} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {TimeHelper} from "../../../utils/TimeHelper";
import Overlay from "rsuite/Overlay";
import NewTextModal from "../../../components/sms/NewTextModal/NewTextModal";
import AppointmentCheckInOut from "../../../components/Appointment/CheckInOut/AppointmentCheckInOut";
import AppointmentCancel from "../../../components/Appointment/Cancel/AppointmentCancel";
import AppointmentModify from "../../../components/Appointment/Modify/AppointmentModify";

export default function DashboardAppointments(props) {

    const {currentUser} = useAuth();
    const [appointments, setAppointments] = useState(null);
    const [activeDate, setActiveDate] = useState(new Date());
    const [fetching, setFetching] = useState(false);
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    activeDate.setHours(0, 0, 0, 0);

    const fetchAppointments = async (dontScroll) => {
        activeDate.setHours(0, 0, 0, 0);
        setFetching(true);

        try {
            const res = await (await APIConnector.create(2000, currentUser)).post(`/appointments`, {
                date: activeDate.toISOString()
            });

            setAppointments(res.data);

            if (!dontScroll) {
                if (document.getElementById("current-time-line")) {

                    document.getElementsByClassName("page-root")[0].scrollTo({
                        top: document.getElementById("current-time-line").offsetTop - 200,
                        behavior: 'smooth'
                    });
                }
            }
        } catch (err) {

        }

        setFetching(false);
    }

    useEffect(() => {
        if (!appointments) fetchAppointments();
    }, []);

    useEffect(() => {
        fetchAppointments(true);
    }, [activeDate]);

    if (!appointments) {
        return (
            <Loader backdrop size={"lg"} vertical/>
        )
    }

    const providers = Object.keys(appointments).map((staffId) => {
        const data = appointments[staffId];
        return {
            doc_id: staffId,
            firstname: data.staff.firstname,
            lastname: data.staff.lastname,
            photoURL: data.staff.photoURL
        }
    });

    const isToday = () => {
        const today = new Date();
        return today.getFullYear() === activeDate.getFullYear() &&
            today.getMonth() === activeDate.getMonth() &&
            today.getDate() === activeDate.getDate()
    }

    const getHoursForDay = (staff_id) => {
        const dayOfWeek = days[activeDate.getDay()];

        if (appointments[staff_id]?.staff?.schedule) {
            if (appointments[staff_id].staff.schedule[dayOfWeek]?.day) {
                return (appointments[staff_id].staff.schedule[dayOfWeek].day[1] - appointments[staff_id].staff.schedule[dayOfWeek].day[0]) + " hours";
            }
        }

        return "Not Scheduled";
    }

    const isLunchBlock = (staff_id, timeSlot) => {
        const dayOfWeek = days[activeDate.getDay()];

        if (appointments[staff_id].staff?.schedule && appointments[staff_id].staff?.schedule[dayOfWeek]) {
            if (appointments[staff_id].staff?.schedule[dayOfWeek]["lunch"]) {
                const lunchSchedule = appointments[staff_id].staff?.schedule[dayOfWeek]["lunch"];
                const timeSlotVal = parseFloat(TimeHelper.getSliderValFrom24(timeSlot));
                return timeSlotVal >= parseFloat(lunchSchedule[0]) && timeSlotVal <= parseFloat(lunchSchedule[1]);
            }
        }

        return false;
    }


    const renderRows = () => {
        let timeMap = [];
        for (let hour = 4; hour <= 20; hour += 0.5) timeMap.push(TimeHelper.sliderValTo24(hour));

        return timeMap.map((hour, index2) => {
            return (
                <div key={hour} className={styles.row}>
                    <div className={styles.timeStamp}>
                        <span>{TimeHelper.convertTime24to12(hour)}</span>
                    </div>
                    {Object.keys(appointments).map((staff_id, index) => {
                        return (
                            <div key={"block_" + index}
                                 className={styles.block + (isLunchBlock(staff_id, hour) ? " " + styles.lunch : "")}>
                                <h5>LUNCH</h5>
                                {index2 === 1 && appointments[staff_id].appointments.map((app) => <Appointment key={app.doc_id} appointment={app} fetchAppointments={fetchAppointments} /> )}
                            </div>
                        )
                    })}
                </div>
            )
        });
    }


    return (
        <>
            <div className={styles.container}>
                <div className={styles.headers}>
                    <div className={styles.mainControls}>
                        <div className={styles.dayControls}>
                            <button type={"button"} onClick={() => {
                                const newDate = new Date(activeDate);
                                newDate.setDate(newDate.getDate() - 1);
                                setActiveDate(newDate);
                            }}>
                                <FontAwesomeIcon icon={faChevronLeft}/>
                            </button>
                            <button type={"button"} onClick={() => {
                                const newDate = new Date(activeDate);
                                newDate.setDate(newDate.getDate() + 1);
                                setActiveDate(newDate);
                            }}>
                                <FontAwesomeIcon icon={faChevronRight}/>
                            </button>
                        </div>

                        <div className={styles.activeDate}>
                            <button type={"button"} onClick={() => {
                                if (typeof document !== "undefined") {
                                    document.getElementById("date-picker").click();
                                }
                            }}>
                                {activeDate.toLocaleDateString([], {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </button>

                            {isToday() && <span>Today</span>}
                            <DatePicker className={styles.datePicker} id="date-picker" appearance="subtle"
                                        placeholder="Subtle" style={{width: 200}}
                                        onChange={(date) => setActiveDate(date)}/>
                        </div>
                    </div>
                    <div className={styles.providers}>
                <span className={styles.timeStamp + " " + styles.allDay}>
                    All Day
                </span>
                        {providers.map(({firstname, lastname, doc_id, photoURL}) => {
                            return (
                                <div key={doc_id}>
                                    <img src={photoURL} alt={firstname + " " + lastname}/>
                                    <div>
                                        <span>{firstname} {lastname}</span>
                                        <small>{getHoursForDay(doc_id)}</small>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className={styles.events}>
                    {renderRows()}
                    <CurrentTimeLine/>
                </div>

            </div>
            {fetching && <Loader backdrop size={"lg"} vertical style={{position: "sticky", zIndex: 4, width: "100%"}}/>}

        </>
    )

}

function Appointment({appointment, fetchAppointments}) {

    let totalMinutes = 0;
    appointment.services.forEach((arg) => totalMinutes += arg.duration);

    const marginTop = () => {
        const appDate = new Date(appointment.start.dateTime);
        const hours = appDate.getHours() - 4.5;
        const minutes = appDate.getMinutes();
        const totalMinutes = (hours * 60) + minutes;
        return totalMinutes * (100 / 30) - 10;
    }

    const icon = appointment?.check_out ? <FontAwesomeIcon icon={faCheckCircle}/> : appointment?.check_in ?
        <FontAwesomeIcon icon={faCog} className={"spin"}/> :
        <FontAwesomeIcon icon={faExclamationTriangle}/>;
    const status = appointment?.check_out ? "Completed!" : appointment?.check_in ? "In progress" : "Check in"
    const color = appointment?.check_out ? styles.checked_out : appointment?.check_in ? styles.checked_in : styles.attention;

    const Overlay = forwardRef(({style, onClose, appointment, ...rest}, ref) => {
        const styles = {
            ...style,
        };

        return (
            <div {...rest} style={styles} ref={ref}>
                <button type={"button"} onClick={() => toaster.push(<AuthProvider><AppointmentCheckInOut checkIn={true}
                                                                                                         appointment_id={appointment.doc_id}
                                                                                                         onComplete={() => fetchAppointments(true)}/></AuthProvider>)}>Check-In
                </button>
                <br/>
                <button type={"button"} disabled={!appointment?.check_in}
                        onClick={() => toaster.push(<AuthProvider><AppointmentCheckInOut checkIn={false}
                                                                                         appointment_id={appointment.doc_id}
                                                                                         onComplete={() => fetchAppointments(true)}/></AuthProvider>)}>Check-Out
                </button>
                <br/>
                <button type={"button"}
                        onClick={() => toaster.push(<AuthProvider><AppointmentModify appointment={appointment}
                                                                                     onComplete={() => fetchAppointments(true)}/></AuthProvider>)}>Edit
                    / Modify
                </button>
                <hr/>
                <button type={"button"}
                        onClick={() => toaster.push(<AuthProvider><AppointmentCancel appointment_id={appointment.doc_id}
                                                                                     onComplete={() => fetchAppointments(true)}/></AuthProvider>)}>Cancel
                    Appointment
                </button>
            </div>
        );
    });

    Overlay.displayName = "Overlay";

    return (
        <div className={styles.appointment} style={{
            height: (totalMinutes * (100 / 30) - 3) + "px",
            maxHeight: (totalMinutes * (100 / 30) - 3) + "px",
            marginTop: marginTop() + "px"
        }}>
            <div className={styles.innerds}>

                <div className={styles.infoBar}>
                    <div className={styles.left}>
                                                    <span>
                                                    {new Date(appointment.start.dateTime).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                        {" - "}
                                                        {new Date(appointment.end.dateTime).toLocaleTimeString([], {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>

                        <span className={color}>
                                                        {icon}
                            {" "}
                            {status}
                                                    </span>
                    </div>
                    <Whisper
                        trigger="click"
                        speaker={(props, ref) => {
                            const {left, top, onClose} = props;
                            return <Overlay style={{left, top}} appointment={appointment}
                                            onClose={onClose}
                                            className={styles.overlay + " fadeIn"}
                                            ref={ref}/>;
                        }}
                    >
                        <Button className={styles.editBtn}><FontAwesomeIcon
                            icon={faEllipsis}/></Button>
                    </Whisper>
                </div>

                <div className={styles.body}>
                    <div className={styles.leadInfo}>
                        <label>Client Info:</label>
                        <span>Name: {appointment.lead.name}</span>
                        <span>Email: {appointment.lead.email}</span>
                        <span>Phone: <button type={"button"}
                                             onClick={() => toaster.push(
                                                 <AuthProvider><NewTextModal
                                                     phone={appointment.lead.phone}/></AuthProvider>)}><Tag
                            color="blue">{appointment.lead.phone}</Tag></button></span>
                    </div>
                    <div className={styles.services}>
                        <label>Services:</label>
                        {appointment.services.map(({name}) => <span
                            key={Math.random()}>{name}</span>)}
                    </div>
                </div>


            </div>
        </div>
    )

}

function CurrentTimeLine() {

    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const getCurrentTimeOffset = () => {
        if (now.getHours() === 4) {
            return now.getMinutes() * (100 / 30);
        } else if (now.getHours() >= 20) {
            if (now.getMinutes() >= 30) {
                return -1000;
            }
        }

        const hours = now.getHours() - 4;
        const minutes = now.getMinutes();
        const totalMinutes = (hours * 60) + minutes;

        return totalMinutes * (100 / 30);
    }

    return (
        <div className={styles.currentTimeLine} style={{marginTop: (getCurrentTimeOffset()) + "px"}}
             id={"current-time-line"}>
            <span>{TimeHelper.convertTime24to12(now.getHours() + ":" + now.getMinutes())}</span>
        </div>
    )

}