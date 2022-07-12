import styles from "./styles.module.css";
import {MaskedInput} from "../../inputs/MaskedInput";
import {EditableField} from "./EditableField";
import {addDashes} from "../../../pages/admin/dashboard/customers";

export function PersonalInformation({customer}) {

    async function updateValue(dataKey, value) {

    }

    return (
        <div className={styles.homeTab}>
            <EditableField accepter={MaskedInput} dataKey={"firstName"} label={"First Name:"} customer={customer} onBlur={(value) => updateValue("firstName", value)} />
            <EditableField accepter={MaskedInput} dataKey={"lastName"} label={"Last Name:"} customer={customer} onBlur={(value) => updateValue("lastName", value)} />
            <EditableField accepter={MaskedInput} dataKey={"email"} label={"Email:"} customer={customer} onBlur={(value) => updateValue("email", value)} type={"email"} />
            <EditableField accepter={MaskedInput} dataKey={"phoneNumber"} label={"Phone Number:"} customer={customer} onBlur={(value) => updateValue("phoneNumber", value)}
                           type={"tel"} formattedValue={addDashes(customer["phoneNumber"])} mask={"999-999-9999"} maskChar={""} />
            <EditableField accepter={MaskedInput} dataKey={"dob"} label={["DOB", <span key={"dobHint"} className={styles.dobHint}>(YYYY-MM-DD)</span>, ":"]} mask={"9999-99-99"} maskChar={""} customer={customer} onBlur={(value) => updateValue("dob", value)} />
        </div>
    )

}