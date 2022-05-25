import styles from '../styles/Booking.module.css'
import PersonalInformation from "../components/BookingStages/PersonalInformation/PersonalInformation";
import {useState} from "react";

export default function Home() {

    const [formValues, setFormValues] = useState({});
    const [submitted, setSubmitted] = useState(false);

    const appendFormValues = (values) => {
        setSubmitted(true);
        setFormValues({...formValues, ...values});
        setSubmitted(false);
    }

    const PROPS = {
        formValues, setFormValues, appendFormValues, submitted, setSubmitted
    }

    return (
        <div className={styles.container}>
            <PersonalInformation {...PROPS} />
        </div>
    )
}
