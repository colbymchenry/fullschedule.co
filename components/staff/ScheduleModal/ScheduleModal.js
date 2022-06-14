import styles from './styles.module.css';
import React, {useState} from "react";
import {useAuth} from "../../../context/AuthContext";
import {Button, Modal, Notification, RangeSlider, toaster} from "rsuite";
import {TimeHelper} from "../../../utils/TimeHelper";
import {APIConnector} from "../../APIConnector";

export default function ScheduleModal(props) {

    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

    const [visible, setVisible] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [triggerRender, setTriggerRender] = useState(false);
    const [values, setValues] = useState(props?.staff?.schedule || {});
    const [selectedDay, setSelectedDay] = useState("monday");
    const {currentUser} = useAuth();

    // TODO: Store and use schedule
    const setSchedule = async (passed) => {
        if (!passed) return;

        setSubmitted(true);
        try {
            await (await APIConnector.create(10000, currentUser)).post(`/staff/set-schedule?id=${props.staff.doc_id}`, values);

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
                                return <span>{TimeHelper.convertTime24to12(TimeHelper.sliderValTo24(mark))}</span>;
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
                                return <span>{TimeHelper.convertTime24to12(TimeHelper.sliderValTo24(mark))}</span>;
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