import styles from "./styles.module.css";
import {MaskedInput} from "../../inputs/MaskedInput";
import {EditableField} from "./EditableField";
import {addDashes} from "../../../pages/admin/dashboard/customers";

export function HomeTab({customer}) {

    return (
        <div className={styles.homeTab}>
            <EditableField accepter={MaskedInput} dataKey={"firstName"} label={"First Name:"} customer={customer} onBlur={(value) => alert(value)} />
            <EditableField accepter={MaskedInput} dataKey={"lastName"} label={"Last Name:"} customer={customer} />
            <EditableField accepter={MaskedInput} dataKey={"email"} label={"Email:"} customer={customer} />
            <EditableField accepter={MaskedInput} dataKey={"phoneNumber"} label={"Phone Number:"} customer={customer} formattedValue={addDashes(customer["phoneNumber"])} />
            <EditableField accepter={MaskedInput} dataKey={"dob"} label={"DOB:"} customer={customer} />
        </div>
    )

}