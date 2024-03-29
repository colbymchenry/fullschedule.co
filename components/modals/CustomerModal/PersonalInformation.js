import styles from "./styles.module.css";
import {MaskedInput} from "../../inputs/MaskedInput";
import {EditableField} from "./EditableField";
import {addDashes} from "../../../pages/admin/dashboard/customers";
import {useState} from "react";

export function PersonalInformation({customer}) {

    const [isError, setError] = useState(false);

    return (
        <div className={styles.homeTab}>
            <EditableField accepter={MaskedInput} dataKey={"firstName"} label={"First Name:"} customer={customer} setError={setError} />
            <EditableField accepter={MaskedInput} dataKey={"lastName"} label={"Last Name:"} customer={customer} setError={setError} />
            <EditableField accepter={MaskedInput} dataKey={"email"} label={"Email:"} customer={customer} setError={setError} />
            <EditableField accepter={MaskedInput} dataKey={"phoneNumber"} label={"Phone Number:"} customer={customer} setError={setError}
                           type={"tel"} formattedValue={addDashes(customer["phoneNumber"])} mask={"999-999-9999"} maskChar={""} />
            <EditableField accepter={MaskedInput} dataKey={"dob"} label={["DOB", <span key={"dobHint"} className={styles.dobHint}>(YYYY-MM-DD)</span>, ":"]} mask={"9999-99-99"} maskChar={""} customer={customer} setError={setError} />
            {isError && <small className={"error"} style={{ marginTop: '1rem' }}>A server error occurred.</small>}
        </div>
    )

}