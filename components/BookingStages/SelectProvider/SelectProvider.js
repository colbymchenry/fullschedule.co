import styles from './styles.module.css'
import React, {useEffect, useState} from "react";
import {Button, Form, Notification, toaster, Loader} from "rsuite";
import axios from "axios";
import {TimeHelper} from "../../../utils/TimeHelper";
import ArrayHelper from "../../../utils/ArrayHelper";

export default function SelectProvider(props) {

    const [submitted, setSubmitted] = useState(false);
    const [formValue, setFormValue] = useState({selectedStaff: null, selectedTimeSlot: null});
    const [timeSlots, setTimeSlots] = useState(null);

    useEffect(() => {
        (async () => {
            await fetchTimeSlots();
        })();
    }, [])

    const submitForm = async () => {
        setSubmitted(true);
        try {
            const leadUpdate = await axios.post(`/api/booking/update-lead?id=${props.formValues.lead.doc_id}`, formValue);
            if (!props.isBookingFee) {
                const createBooking = await axios.post(`/api/booking/create-booking?id=${props.formValues.lead.doc_id}`, {...props.formValues.lead, ...formValue});
                props.appendFormValues({...leadUpdate.data, booking: createBooking.data})
            } else {
                props.appendFormValues(leadUpdate.data);
            }
        } catch (error) {
            toaster.push(<Notification type={"error"}
                                       header={"Error connecting to database. Please email, call, or use our live chat to reach us."}/>, {
                placement: 'topEnd'
            });

            setSubmitted(false);
        }
    }

    const fetchTimeSlots = async () => {
        const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        const date = new Date(props.formValues.lead.date);
        try {
            const res = await axios.post(`/api/booking/get-available-time-slots?id=${props.formValues.lead.doc_id}`, {
                date,
                day: days[date.getDay()]
            });

            setTimeSlots(res.data);
        } catch (error) {
            toaster.push(<Notification type={"error"}
                                       header={error?.response?.data?.message || "Error connecting to database. Please email, call, or use our live chat to reach us."}/>, {
                placement: 'topEnd'
            });
        }
    }

    const staffIsAuthorizedForServices = (staff) => {
        const selectedServicesDocIds = props.formValues.lead.services.map((service) => service.doc_id);
        const staffServiceDocIds = staff.services.map((id) => props.setupData.services.find((service) => service.id === id).doc_id);
        return ArrayHelper.containsAll(selectedServicesDocIds, staffServiceDocIds);
    }

    const renderStaff = () => {
        return props.setupData.staff.filter((staff) => staff["schedule"] && staff["photoURL"] && staffIsAuthorizedForServices(staff)).map((staff) => {
            return (
                <div key={staff.doc_id} className={styles.staffMasterBody}>
                    <div key={staff.doc_id} className={styles.staffBody}>
                        <div>
                            <img src={staff.photoURL} alt={staff.firstname + " " + staff.lastname}/>
                        </div>
                        <h5>{staff.firstname} {staff.lastname}</h5>
                    </div>
                    <div className={styles.timeSlots}>
                        {(() => {
                            if (!timeSlots) return <Loader content={"Loading..."} />

                            if (timeSlots[staff.doc_id]) {
                                return timeSlots[staff.doc_id].map((timeSlot) => {
                                    const isSelected = formValue?.selectedStaff?.doc_id === staff?.doc_id && formValue?.selectedTimeSlot === timeSlot;
                                    return <span key={timeSlot}
                                                 className={"rs-btn rs-btn-active" + (isSelected ? " rs-btn-primary": " rs-btn-subtle")}
                                                 onClick={() => setFormValue({selectedStaff: staff, selectedTimeSlot: timeSlot})}>{TimeHelper.convertTime24to12(TimeHelper.sliderValTo24(timeSlot))}</span>
                                })
                            } else {
                                return <span>No availability.</span>
                            }
                        })()}
                    </div>
                </div>

            )
        })
    }

    return (
        <Form formValue={formValue} disabled={props.submitted} readOnly={props.submitted}>
            <div className={styles.staffContainer}>
                {renderStaff()}
            </div>
            <div style={{marginTop: "4rem"}}>
                <Button appearance="primary" type="submit" onClick={submitForm} loading={submitted}
                        disabled={formValue.selectedStaff === null || formValue.selectedTimeSlot === null}>Next</Button>
                {/*<Button appearance="primary" type="button" onClick={fetchTimeSlots}>Fetch Time Slots</Button>*/}
            </div>
        </Form>
    )

}
