import styles from '../styles/Booking.module.css'
import PersonalInformation from "../components/BookingStages/PersonalInformation/PersonalInformation";
import React, {useEffect, useState} from "react";
import SelectServices from "../components/BookingStages/SelectServices/SelectServices";
import {Notification, toaster} from "rsuite";
import axios from "axios";

export default function Home() {

    const [formValues, setFormValues] = useState({});
    const [stage, setStage] = useState(1);
    const [setupData, setSetupData] = useState(null);

    const appendFormValues = (values) => {
        setFormValues({...formValues, ...values});
        setStage((prevStage) => prevStage + 1);
    }

    const PROPS = {
        formValues, setFormValues, appendFormValues, setupData
    }

    const renderStage = () => {
        switch (stage) {
            case 1: return <PersonalInformation {...PROPS} />;
            case 2: return <SelectServices {...PROPS} />;
        }
    }

    useEffect(() => {

        if (!setupData) {
            (async () => {
                try {
                    const data = await axios.get("/api/booking/setup-data");
                    setSetupData(data.data);
                } catch (error) {
                    toaster.push(<Notification type={"error"} header={"Error connecting to database. Please email, call, or use our live chat to reach us."}/>, {
                        placement: 'topEnd'
                    });
                }
            })();
        }

    }, []);

    return (
        <div className={styles.container}>
            {renderStage()}
        </div>
    )
}
