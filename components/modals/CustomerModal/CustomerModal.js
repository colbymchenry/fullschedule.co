import ConfirmModal from "../ConfirmModal/ConfirmModal";
import {useState} from "react";
import {Button, Drawer, Form, Nav} from "rsuite";
import {Paragraph} from "@rsuite/icons";
import styles from './styles.module.css';
import {addDashes} from "../../../pages/admin/dashboard/customers";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencil} from "@fortawesome/free-solid-svg-icons";
import {Field} from "../../inputs/Field";
import {MaskedInput} from "../../inputs/MaskedInput";


export default function CustomerModal({customer}) {

    const [activeTab, setActiveTab] = useState('home');
    const [open, setOpen] = useState(true);
    const [loading, setLoading] = useState(false);

    const CustomNav = ({ active, onSelect, ...props }) => {
        return (
            <Nav {...props} activeKey={active} onSelect={onSelect} style={styles}>
                <Nav.Item eventKey="home">Personal Information</Nav.Item>
                <Nav.Item eventKey="history">History</Nav.Item>
                <Nav.Item eventKey="notes">Notes</Nav.Item>
            </Nav>
        );
    };

    console.log(customer)
    return (
        <Drawer placement={'right'} open={open} onClose={() => setOpen(false)}>
            <Drawer.Header>
                <Drawer.Title>{customer.firstName} {customer.lastName}</Drawer.Title>
                <Drawer.Actions>
                    <Button appearance="primary" color={"red"} loading={loading}>
                        Delete
                    </Button>
                </Drawer.Actions>
            </Drawer.Header>
            <Drawer.Body>
                <CustomNav appearance="tabs" reversed active={activeTab} onSelect={setActiveTab} className={styles.nav} />
                {activeTab === 'home' ?
                    (
                        <div className={styles.homeTab}>
                            <EditableField accepter={MaskedInput} dataKey={"firstName"} label={"First Name:"} customer={customer} />
                            <EditableField accepter={MaskedInput} dataKey={"lastName"} label={"Last Name:"} customer={customer} />
                            <EditableField accepter={MaskedInput} dataKey={"email"} label={"Email:"} customer={customer} />
                            <EditableField accepter={MaskedInput} dataKey={"phoneNumber"} label={"Phone Number:"} customer={customer} />
                            <EditableField accepter={MaskedInput} dataKey={"dob"} label={"DOB:"} customer={customer} />
                        </div>
                    ) : activeTab === 'history' ?
                        (
                            <>
                            </>
                        ) :
                        (
                            <>
                            </>
                        )
                }

            </Drawer.Body>
        </Drawer>
    )

    // return (
    //     <ConfirmModal open={open} handleClose={() => setOpen(false)} title={customer.firstName + " " + customer.lastName} hideFooter>
    //
    //     </ConfirmModal>
    // )

}

function EditableField(props) {

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
                    value={value}
                    name={props.dataKey}
                    accepter={props.accepter}
                    error={""}
                />
                </Form>
            </div>
        )
    }

    return (
        <div className={styles.inputFieldGroup}>
            <label>{props.label}</label>
            <span>{value} <button type={"button"} onClick={() => setEditing(true)}><FontAwesomeIcon icon={faPencil} /></button></span>
        </div>
    )

}