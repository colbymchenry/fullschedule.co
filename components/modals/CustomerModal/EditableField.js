import styles from "./styles.module.css";
import {Button, Form} from "rsuite";
import {Field} from "../../inputs/Field";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencil, faSave, faSpinner} from "@fortawesome/free-solid-svg-icons";
import {useState} from "react";
import {APIConnector} from "../../APIConnector";
import {useAuth} from "../../../context/AuthContext";

export function EditableField(props) {

    const { currentUser } = useAuth();
    const [editing, setEditing] = useState(false);
    const [formValue, setFormValue] = useState({
        [props.dataKey]: props.customer[props.dataKey]
    });
    const [saving, setSaving] = useState(false);

    async function updateValue() {
        if (props.customer[props.dataKey] === formValue[props.dataKey]) {
            setEditing(false);
            return;
        }

        setSaving(true);
        try {
            const res = await (await APIConnector.create(2000, currentUser)).post(`/clover/update-customer?id=${props.customer.doc_id}`, {
                [props.dataKey]: formValue[props.dataKey]
            });
        } catch (error) {
            console.error(error);
            props.setError(true);
        }
        setSaving(false);
        setEditing(false);
    }

    if (editing) {
        return (
            <div className={styles.inputFieldGroup}>
                <label htmlFor={props.dataKey}>{props.label}</label>
                <Form formValue={formValue} onChange={formValue => {
                    setFormValue(formValue);
                }}>
                    <Field
                        defaultValue={props.customer[props.dataKey]}
                        name={props.dataKey}
                        id={props.dataKey}
                        accepter={props.accepter}
                        error={""}
                        mask={props.mask}
                        maskChar={props.maskChar}
                        type={props.type || "text"}
                        disabled={saving}
                        readOnly={saving}
                    >
                        <button type={"button"} className={styles.saveBtn + (saving ? ' spin' : '')} onClick={updateValue}><FontAwesomeIcon icon={saving ? faSpinner : faSave} /></button>
                    </Field>
                </Form>
            </div>
        )
    }

    return (
        <div className={styles.inputFieldGroup}>
            <label>{props.label}</label>
            <span>{props.formattedValue || props.customer[props.dataKey]} <button type={"button"} onClick={() => setEditing(true)}><FontAwesomeIcon icon={faPencil} /></button></span>
        </div>
    )

}