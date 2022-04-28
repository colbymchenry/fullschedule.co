import styles from './styles.module.css';
import React, {useEffect, useRef, useState} from "react";
import {useAuth} from "../../../context/AuthContext";
import {APIConnector} from "../../APIConnector";
import {Button, Form, Modal, Notification, RangeSlider, Schema, toaster} from "rsuite";
import {Field} from "../../inputs/Field";
import {InputPassword} from "../../inputs/InputPassword";
import {TimeHelper} from "../../../utils/TimeHelper";

const {StringType} = Schema.Types;

export default function ScheduleModal(props) {

    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

    const [visible, setVisible] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [triggerRender, setTriggerRender] = useState(false);
    const [values, setValues] = useState({});
    const [selectedDay, setSelectedDay] = useState("monday");
    const {currentUser} = useAuth();

    // TODO: Store and use schedule
    const setSchedule = async (passed) => {
        if (!passed) return;

        setSubmitted(true);
        try {
            // await (await APIConnector.create(2000, currentUser)).post("/staff/change-password", {...formValue, uid: props.staff.uid });
            toaster.push(<Notification type={"success"} header={"Schedule updated!"}/>, {
                placement: 'topEnd'
            });
            setVisible(false);
        } catch (error) {

            toaster.push(<Notification type={"error"} header={"Failed to create staff account."}/>, {
                placement: 'topEnd'
            });
            console.error(error);

            setSubmitted(false);
        }
    }

    return (

        <Modal open={visible} onClose={() => setVisible(false)} backdrop={"static"} size={"lg"}>
            <Modal.Header>
                <div className={`d-flex align-items-center`} style={{ gap: '1rem' }}>
                    <Modal.Title style={{ width: 'auto' }}>{props.staff.firstname} {props.staff.lastname}&apos;s Schedule</Modal.Title>
                    {days.map((day) => <Button key={day} appearance="subtle" className={selectedDay === day ? styles.active : ""} onClick={() => setSelectedDay(day)}>{day}</Button>)}
                </div>

            </Modal.Header>
            <Modal.Body>
                <div className={styles.body}>
                    <div className={styles.slider}>
                        <span>Day End</span>
                        <RangeSlider min={4} max={22} step={0.5} value={values[selectedDay]?.day || [22, 22]} defaultValue={[22, 22]} graduated
                                     progress vertical tooltip={false} renderMark={mark => {
                            const timestamp24 = mark.toString().includes(".") ? mark.toString().split(".")[0] + ":" + (60 * parseFloat("0." + mark.toString().split(".")[1])) : mark + ":00";
                            return <span>{TimeHelper.convertTime24to12(timestamp24)}</span>;
                        }} onChange={v => {
                            if (values[selectedDay]) {
                                values[selectedDay]["day"] = v;
                            } else {
                                values[selectedDay] = {
                                    day: v
                                }
                            }
                            setValues(values);
                            setTriggerRender(!triggerRender)
                        }}/>
                        <span>Day Start</span>
                    </div>
                    <div className={styles.slider}>
                        <span>Lunch End</span>
                        <RangeSlider min={4} max={22} step={0.5} value={values[selectedDay]?.lunch || [22, 22]} defaultValue={[22, 22]} graduated
                                     progress vertical tooltip={false} renderMark={mark => {
                            const timestamp24 = mark.toString().includes(".") ? mark.toString().split(".")[0] + ":" + (60 * parseFloat("0." + mark.toString().split(".")[1])) : mark + ":00";
                            return <span>{TimeHelper.convertTime24to12(timestamp24)}</span>;
                        }} onChange={v => {
                            if (values[selectedDay]) {
                                values[selectedDay]["lunch"] = v;
                            } else {
                                values[selectedDay] = {
                                    lunch: v
                                }
                            }
                            setValues(values);
                            setTriggerRender(!triggerRender)
                        }}/>
                        <span>Lunch Start</span>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer style={{ height: '56px' }}>
                <br/>
                <Button onClick={setSchedule} appearance="primary" loading={submitted}>
                    Submit
                </Button>
                <Button onClick={() => setVisible(false)} appearance="subtle">
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    )

}