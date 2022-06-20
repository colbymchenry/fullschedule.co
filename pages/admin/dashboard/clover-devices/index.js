import React, {useEffect, useState} from "react";
import {Button, Notification, Table, toaster} from "rsuite";
import NewTextModal from "../../../../components/sms/NewTextModal/NewTextModal";
import {useCollectionData} from 'react-firebase-hooks/firestore';
import {FirebaseClient} from "../../../../utils/firebase/FirebaseClient";
import {collection, orderBy, query, where} from "firebase/firestore";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faExclamationTriangle, faTrashAlt} from "@fortawesome/free-solid-svg-icons";
import styles from "./styles.module.css";
import ConfirmModal from "../../../../components/modals/ConfirmModal/ConfirmModal";
import ConversationModal from "../../../../components/sms/ConversationModal/ConversationModal";
import {AuthProvider} from "../../../../context/AuthContext";
import FullWidthTable from "../../../../components/FullWidthTable/FullWidthTable";
import NewCloverDeviceModal from "../../../../components/modals/NewCloverDeviceModal/NewCloverDeviceModal";

export default function DashboardCloverDevices(props) {

    const [cloverDevices, setCloverDevices] = useState(null);

    const getCloverDevices = async () => {
        try {
            const devices = await FirebaseClient.collection("clover_devices");
            setCloverDevices(devices);
        } catch (error) {
            console.error(error);
            toaster.push(<Notification type={"error"} header={"Failed to retrieve clover device."}/>, {
                placement: 'topEnd'
            });
        }
    }

    useEffect(() => {
        if (!cloverDevices) {
            (async () => {
                await getCloverDevices();
            })();
        }
    }, []);

    const deleteCloverDevice = async (doc_id) => {
        toaster.push(<ConfirmModal title={"Confirm"} onConfirm={async () => {
            try {
                await FirebaseClient.delete("clover_devices", doc_id);

                await getCloverDevices();

                toaster.push(<Notification type={"success"} header={"Clover device deleted!"}/>, {
                    placement: 'topEnd'
                });
            } catch (error) {
                console.error(error);
                toaster.push(<Notification type={"error"} header={"Failed to delete clover device."}/>, {
                    placement: 'topEnd'
                });
            }
        }
        }><p><FontAwesomeIcon icon={faExclamationTriangle} color={"yellow"}/> Warning: Deleting a Clover device is irreversible.<br/><br/>Are you sure?</p></ConfirmModal>)
    }

    const DeleteCell = ({rowData, dataKey, ...props}) => (
        <Table.Cell {...props}>
            <div className={styles.trash} onClick={() => deleteCloverDevice(rowData['doc_id'])}><FontAwesomeIcon
                icon={faTrashAlt}/></div>
        </Table.Cell>
    );

    return (
        <div style={{height: '80vh'}}>
            <FullWidthTable data={cloverDevices || []} className={`m-4`} loading={!cloverDevices} fillHeight={true}>
                <Table.Column width={60} align="center">
                    <Table.HeaderCell>{""}</Table.HeaderCell>
                    <DeleteCell/>
                </Table.Column>
                <Table.Column width={300} resizable>
                    <Table.HeaderCell>Serial Number</Table.HeaderCell>
                    <Table.Cell dataKey="serialNumber" />
                </Table.Column>
                <Table.Column width={300}>
                    <Table.HeaderCell>POS Name</Table.HeaderCell>
                    <Table.Cell dataKey="posName"/>
                </Table.Column>
                <Table.Column width={500} resizable>
                    <Table.HeaderCell>Endpoint/IP</Table.HeaderCell>
                    <Table.Cell dataKey="endpoint"/>
                </Table.Column>
            </FullWidthTable>
            <Button appearance="primary" onClick={() => toaster.push(<AuthProvider><NewCloverDeviceModal/></AuthProvider>)} className={'save-button'}>New Device</Button>
        </div>
    )

}