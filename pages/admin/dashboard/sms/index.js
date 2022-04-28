import React, {useEffect, useState} from "react";
import {Button, Notification, Table, toaster} from "rsuite";
import NewTextModal from "../../../../components/sms/NewTextModal/NewTextModal";
import {useCollectionData} from 'react-firebase-hooks/firestore';
import {FirebaseClient} from "../../../../utils/firebase/FirebaseClient";
import {collection, query, orderBy, where} from "firebase/firestore";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faExclamationTriangle, faTrashAlt} from "@fortawesome/free-solid-svg-icons";
import styles from "./styles.module.css";
import ConfirmModal from "../../../../components/modals/ConfirmModal/ConfirmModal";
import ConversationModal from "../../../../components/sms/ConversationModal/ConversationModal";
import {AuthProvider} from "../../../../context/AuthContext";
import FullWidthTable from "../../../../components/FullWidthTable/FullWidthTable";

export default function DashboardSMS(props) {

    const [value, loading, error] = useCollectionData(
        query(collection(FirebaseClient.db(), 'sms_messages'), orderBy("sent_at", "desc")),
        {
            snapshotListenOptions: {includeMetadataChanges: true},
        }
    );

    const tableData = () => {
        let added = []
        let texts = []

        if (!value) return [];

        value.forEach((txt) => {
            if (!added.includes(txt.receiver)) {
                texts.push(txt)
                added.push(txt.receiver)
            }
        });

        return texts;
    }

    const deleteTextChain = async (receiver) => {
        toaster.push(<ConfirmModal title={"Confirm"} onConfirm={async () => {
            try {
                await Promise.all((await FirebaseClient.query("sms_messages", where("receiver", "==", receiver))).map(async ({doc_id}) => {
                    await FirebaseClient.delete("sms_messages", doc_id);
                }))

                toaster.push(<Notification type={"success"} header={"Text messages deleted!"}/>, {
                    placement: 'topEnd'
                });
            } catch (error) {
                console.error(error);
                toaster.push(<Notification type={"error"} header={"Failed to delete text messages."}/>, {
                    placement: 'topEnd'
                });
            }
        }
        }><p><FontAwesomeIcon icon={faExclamationTriangle} color={"yellow"}/> Warning: Deleting all text messages with
            this user is irreversible.<br/><br/>Are you sure?</p></ConfirmModal>)
    }

    const DeleteCell = ({rowData, dataKey, ...props}) => (
        <Table.Cell {...props}>
            <div className={styles.trash} onClick={() => deleteTextChain(rowData['receiver'])}><FontAwesomeIcon
                icon={faTrashAlt}/></div>
        </Table.Cell>
    );

    const RecipientCell = ({rowData, dataKey, ...props}) => (
        <Table.Cell {...props}>
            <span className={styles.recipient} onClick={() => toaster.push(<AuthProvider><ConversationModal receiver={rowData["receiver"]}/></AuthProvider>)}>{rowData[dataKey]}</span>
        </Table.Cell>
    );


    return (
        <div style={{height: '80vh'}}>
            <FullWidthTable data={() => tableData()} className={`m-4`} loading={loading} fillHeight={true}>
                <Table.Column width={60} align="center">
                    <Table.HeaderCell>{""}</Table.HeaderCell>
                    <DeleteCell/>
                </Table.Column>
                <Table.Column width={200} align="center" resizable>
                    <Table.HeaderCell>Recipient</Table.HeaderCell>
                    <RecipientCell dataKey="receiver"/>
                </Table.Column>

                <Table.Column width={800}>
                    <Table.HeaderCell>Message</Table.HeaderCell>
                    <Table.Cell dataKey="message"/>
                </Table.Column>
            </FullWidthTable>
            <Button appearance="primary" onClick={() => toaster.push(<AuthProvider><NewTextModal/></AuthProvider>)} className={'save-button'}>New Text</Button>
        </div>
    )

}