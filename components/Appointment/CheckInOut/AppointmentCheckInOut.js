import {Notification, Schema, toaster} from "rsuite";
import React, {useState} from "react";
import {useAuth} from "../../../context/AuthContext";
import ConfirmModal from "../../modals/ConfirmModal/ConfirmModal";
import TimeInput from "../TimeInput";
import {APIConnector} from "../../APIConnector";
import {TimeHelper} from "../../../utils/TimeHelper";

export default function AppointmentCheckInOut(props) {

    const [open, setOpen] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [formValue, setFormValue] = useState({});
    const [formError, setFormError] = useState({});
    const { currentUser } = useAuth();

    const submitForm = async (passed) => {
        if (!passed) return false;

        setSubmitted(true);
        try {
            let now = new Date();
            const [hour, minute] = TimeHelper.convertTime12to24(formValue["hour"] + ":" + formValue["minute"] + " " + formValue["amPm"]).split(":");
            now.setHours(parseInt(hour), parseInt(minute), 0, 0);

            const body = {
                ...(props.checkIn ? { check_in: now.toLocaleString() } : { check_out: now.toLocaleString() })
            }

            await (await APIConnector.create(6000, currentUser)).post(`/appointment/checkinout?id=${props.appointment_id}`, body);

            setOpen(false);
            if (props.onComplete) props.onComplete(body);
        } catch (error) {
            toaster.push(<Notification type={"error"} header={"Failed."}/>, {
                placement: 'topEnd'
            });
            console.error(error);

            setFormError(formError);
            setSubmitted(false);
        }
    }

    return (
        <ConfirmModal open={open} handleClose={() => setOpen(false)} title={props.checkIn ? "Check-In" : "Check-Out"} confirmText={"Submit"} onConfirm={() => submitForm(true)}>
            <TimeInput onChange={(formValue) => setFormValue(formValue)} />
        </ConfirmModal>
    )

}