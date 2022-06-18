import {Form, InputNumber, Radio, RadioGroup, Schema} from "rsuite";
import {useEffect, useState} from "react";
import {Field} from "../inputs/Field";
import styles from "./styles.module.css";
import {TimeHelper} from "../../utils/TimeHelper";

const {NumberType} = Schema.Types;

export default function TimeInput(props) {

    const [formValue, setFormValue] = useState({});
    const [formError, setFormError] = useState({});
    const [triggerRender, setTriggerRender] = useState(false);

    const model = Schema.Model({
        hour: NumberType().isRequired('This field is required.'),
        minute: NumberType().isRequired('This field is required.')
    });

    useEffect(() => {
        const now = new Date();
        const timeStamp = TimeHelper.convertTime24to12(now.getHours() + ":" + now.getMinutes());
        const [hour, minute] = timeStamp.split(" ")[0].split(":");
        const amPm = timeStamp.split(" ")[1];

        setFormValue({
            hour, minute, amPm
        });

        if (props.onChange) props.onChange({
            hour, minute, amPm
        });

        setTriggerRender(!triggerRender);
    }, []);

    return (
            <Form className={styles.form} formValue={formValue} onChange={formValue => {
                setFormValue(formValue);
                if (Object.keys(formError).length) setFormError({});
                if (props.onChange) props.onChange(formValue);
            }} model={model}>
                <div className={styles.section}>
                    <div className={styles.time}>
                        <Field
                            name="hour"
                            label=""
                            type={"number"}
                            max={12}
                            min={1}
                            className={styles.adjustWidth}
                            accepter={InputNumber}
                            error={formError["hour"]}
                        />
                        <span>:</span>
                        <Field
                            name="minute"
                            label=""
                            type={"number"}
                            max={60}
                            min={0}
                            accepter={InputNumber}
                            error={formError["minute"]}
                        />
                    </div>

                    <Form.Group controlId="amPm">
                        <RadioGroup name="amPm" value={formValue["amPm"]} onChange={(value) => {
                            formValue["amPm"] = value;
                            setFormValue(formValue);
                            setTriggerRender(!triggerRender);
                        }}>
                            <Radio value="AM">AM</Radio>
                            <Radio value="PM">PM</Radio>
                        </RadioGroup>
                    </Form.Group>

                </div>
            </Form>
    )

}