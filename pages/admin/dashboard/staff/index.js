import React, {useEffect, useState} from "react";
import FullWidthTable from "../../../../components/FullWidthTable/FullWidthTable";
import {Button, ButtonGroup, Notification, Popover, Table, toaster, Whisper, Dropdown, IconButton} from "rsuite";
import {AuthProvider, useAuth} from "../../../../context/AuthContext";
import StaffModal from "../../../../components/staff/StaffModal/StaffModal";
import Image from "next/image";
import {AvatarSVG} from "../../../../components/SVG";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import styles from "./styles.module.css"
import {faCaretDown, faExclamationTriangle} from "@fortawesome/free-solid-svg-icons";
import ConfirmModal from "../../../../components/modals/ConfirmModal/ConfirmModal";
import {APIConnector} from "../../../../components/APIConnector";
import ChangePasswordModal from "../../../../components/staff/ChangePasswordModal/ChangePasswordModal";
import ScheduleModal from "../../../../components/staff/ScheduleModal/ScheduleModal";

export default function DashboardStaff(props) {

    const {currentUser} = useAuth();
    const [staff, setStaff] = useState(null);

    const deleteStaff = (id) => {
        toaster.push(<ConfirmModal title={"Confirm"} confirmText={"Delete"} onConfirm={async () => {
            try {
                await (await APIConnector.create(2000, currentUser)).post(`/staff/delete`, {
                    id
                });

                toaster.push(<Notification type={"success"} header={"Staff deleted!"}/>, {
                    placement: 'topEnd'
                });
                await refreshStaff();
            } catch (error) {
                console.error(error);
                toaster.push(<Notification type={"error"} header={"Failed to delete staff account."}/>, {
                    placement: 'topEnd'
                });
            }
        }
        }><p><FontAwesomeIcon icon={faExclamationTriangle} color={"yellow"}/> Warning: Deleting a staff account is
            irreversible.<br/><br/>Are you sure?</p></ConfirmModal>)
    }

    const refreshStaff = async () => {
        try {
            const res = await (await APIConnector.create(2000, currentUser)).get(`/staff/get`);
            setStaff(res.data);
        } catch (error) {
            toaster.push(<Notification type={"error"} header={"Failed to get staff accounts."}/>, {
                placement: 'topEnd'
            });
            console.error(error);
        }
    }

    useEffect(() => {
        if (!staff) refreshStaff();
    }, [])

    const AvatarCell = ({rowData, dataKey, ...props}) => (
        <Table.Cell {...props} className={styles.center}>
            {rowData['avatar'] ?
                <Image src={rowData['avatar']} loading={"lazy"} width={64} height={64} style={{borderRadius: '50%'}}
                       alt={""}/>
                : <AvatarSVG style={{width: '60%', height: '60%'}}/>}
        </Table.Cell>
    );

    const InfoCell = ({rowData, dataKey, ...props}) => (
        <Table.Cell {...props} className={styles.infoCell}>
            <p>{rowData["firstname"]} {rowData["lastname"]}<br/><small><i>{rowData["email"]}</i></small></p>
        </Table.Cell>
    );

    const ControlsCell = ({rowData, dataKey, ...props}) => (
        <Table.Cell {...props} className={styles.controlsCell}>
            <ButtonGroup>
                <Button appearance="primary">Actions</Button>
                <Whisper
                    placement="bottomEnd"
                    trigger="click"
                    speaker={({onClose, left, top, className}, ref) => {
                        const handleSelect = eventKey => {
                            onClose();
                            switch (eventKey) {
                                case 0: {
                                    toaster.push(<AuthProvider><ScheduleModal refreshStaff={refreshStaff}
                                                                           staff={rowData}/></AuthProvider>);
                                    break;
                                }
                                case 1: {
                                    toaster.push(<AuthProvider><ChangePasswordModal
                                        staff={rowData}/></AuthProvider>);

                                    break;
                                }
                                case 2: {
                                    toaster.push(<AuthProvider><StaffModal refreshStaff={refreshStaff}
                                                                           staff={rowData}/></AuthProvider>);
                                    break;
                                }
                                case 3: {
                                    deleteStaff(rowData["doc_id"]);
                                    break;
                                }
                            }
                        };
                        return (
                            <Popover ref={ref} className={className} style={{left, top}} full>
                                <Dropdown.Menu onSelect={handleSelect}>
                                    <Dropdown.Item key={0} eventKey={0}>
                                        Modify Schedule
                                    </Dropdown.Item>
                                    <Dropdown.Item key={1} eventKey={1}>
                                        Change Password
                                    </Dropdown.Item>
                                    <Dropdown.Item key={2} eventKey={2}>
                                        Edit
                                    </Dropdown.Item>
                                    <Dropdown.Item key={3} eventKey={3}>
                                        Delete
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Popover>
                        );
                    }}
                >
                    <IconButton appearance="primary" icon={<FontAwesomeIcon icon={faCaretDown}/>}/>
                </Whisper>
            </ButtonGroup>
        </Table.Cell>
    );

    const data = () => {
        return staff ? staff.filter((staff) => Object.keys(staff).length > 2) : [];
    }

    return (
        <div className={styles.table}>
            <FullWidthTable data={() => data()} className={`m-4`} loading={!staff} rowHeight={90} fillHeight={true}>
                <Table.Column width={100} align="center">
                    <Table.HeaderCell>{""}</Table.HeaderCell>
                    <AvatarCell/>
                </Table.Column>
                <Table.Column width={350}>
                    <Table.HeaderCell>{""}</Table.HeaderCell>
                    <InfoCell/>
                </Table.Column>
                <Table.Column align={"right"}>
                    <Table.HeaderCell>{""}</Table.HeaderCell>
                    <ControlsCell/>
                </Table.Column>
            </FullWidthTable>
            <Button appearance="primary" onClick={() => toaster.push(<AuthProvider><StaffModal
                refreshStaff={refreshStaff}/></AuthProvider>)} className={'save-button'}>New Staff</Button>
        </div>
    )

}