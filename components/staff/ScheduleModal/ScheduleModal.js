import styles from './styles.module.css';
import React, {useState} from "react";
import {useAuth} from "../../../context/AuthContext";
import {Button, Modal, Notification, RangeSlider, toaster} from "rsuite";
import {TimeHelper} from "../../../utils/TimeHelper";

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
            Object.keys(values).forEach((day) => {
                if (values[day]["day"]) {
                    values[day]["day"][0] = sliderValTo24(values[day]["day"][0]);
                    values[day]["day"][1] = sliderValTo24(values[day]["day"][1]);
                }
                if (values[day]["lunch"]) {
                    values[day]["lunch"][0] = sliderValTo24(values[day]["lunch"][0]);
                    values[day]["lunch"][1] = sliderValTo24(values[day]["lunch"][1]);
                }
            })

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

    function sliderValTo24(mark) {
        return mark.toString().includes(".") ? mark.toString().split(".")[0] + ":" + (60 * parseFloat("0." + mark.toString().split(".")[1])) : mark + ":00";
    }

    return (

        <Modal open={visible} onClose={() => setVisible(false)} backdrop={"static"} size={"lg"}>
            <Modal.Header>
                <div className={`d-flex align-items-center`} style={{gap: '1rem'}}>
                    <Modal.Title style={{width: 'auto'}}>{props.staff.firstname} {props.staff.lastname}&apos;s
                        Schedule</Modal.Title>
                    {days.map((day) => <Button key={day} appearance="subtle"
                                               className={selectedDay === day ? styles.active : ""}
                                               onClick={() => setSelectedDay(day)}>{day}</Button>)}
                </div>

            </Modal.Header>
            <Modal.Body style={{ overflow: 'hidden', display: 'flex' }}>
                <div className={styles.body}>
                    <div className={styles.slider}>
                        <span className={styles.header}>Day End</span>
                        <div className={styles.inner}>
                            <RangeSlider min={4} max={22} step={0.5} value={values[selectedDay]?.day || [22, 22]}
                                         defaultValue={[22, 22]} handleClassName={styles.handle} graduated
                                         progress vertical tooltip={false} renderMark={mark => {
                                const timestamp24 = sliderValTo24(mark);
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
                        </div>
                        <span className={styles.header}>Day Start</span>
                    </div>
                    <div className={styles.slider}>
                        <span className={styles.header}>Lunch End</span>
                        <div className={styles.inner}>
                            <RangeSlider min={4} max={22} step={0.5} value={values[selectedDay]?.lunch || [22, 22]}
                                         defaultValue={[22, 22]} handleClassName={styles.handle} graduated
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
                        </div>
                        <span className={styles.header}>Lunch Start</span>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer style={{height: '56px'}}>
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