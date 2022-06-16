import styles from './styles.module.css'
import React, {useState} from "react";
import {Form} from "rsuite";
import useWindowSize from 'react-use/lib/useWindowSize';
import Confetti from 'react-confetti';

export default function BookingConfirmation(props) {

    const { width, height } = useWindowSize()
    const [formValue, setFormValue] = useState({});

    console.log(props)

    return (
        <>
        <Form formValue={formValue} disabled={props.submitted} readOnly={props.submitted}>
            <div className={styles.calendarContainer}>
            </div>
            <div style={{ marginTop: "4rem" }}>
            </div>
        </Form>
        <Confetti
            width={width}
            height={height}
        />
        </>
    )

}
