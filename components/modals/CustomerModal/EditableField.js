import styles from "./styles.module.css";
import {Form} from "rsuite";
import {Field} from "../../inputs/Field";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencil} from "@fortawesome/free-solid-svg-icons";
import {useState} from "react";

export function EditableField(props) {

    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(props.customer[props.dataKey]);

    if (editing) {
        return (
            <div className={styles.inputFieldGroup}>
                <label>{props.label}</label>
                <Form onChange={formValue => {
                    console.log(formValue)
                }}>
                    <Field
                        defaultValue={value}
                        name={props.dataKey}
                        accepter={props.accepter}
                        error={""}
                        onBlur={(e) => {
                            if (props.onBlur) {
                                props.onBlur(e.target.value);
                            }
                            setEditing(false);
                        }}
                    />
                </Form>
            </div>
        )
    }

    return (
        <div className={styles.inputFieldGroup}>
            <label>{props.label}</label>
            <span>{props.formattedValue || value} <button type={"button"} onClick={() => setEditing(true)}><FontAwesomeIcon icon={faPencil} /></button></span>
        </div>
    )

}