import React, {useEffect, useState} from "react";
import {Button, Notification, Table, toaster} from "rsuite";
import NewTextModal from "../../../../components/sms/NewTextModal/NewTextModal";
import {useCollectionData} from 'react-firebase-hooks/firestore';
import {FirebaseClient} from "../../../../utils/firebase/FirebaseClient";
import {collection, orderBy, query, where} from "firebase/firestore";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faExclamationTriangle, faPlus, faTrashAlt} from "@fortawesome/free-solid-svg-icons";
import styles from "./styles.module.css";
import ConfirmModal from "../../../../components/modals/ConfirmModal/ConfirmModal";
import ConversationModal from "../../../../components/sms/ConversationModal/ConversationModal";
import {AuthProvider} from "../../../../context/AuthContext";
import FullWidthTable from "../../../../components/FullWidthTable/FullWidthTable";
import {InputSearch} from "../../../../components/inputs/InputSearch";
import NewCustomerModal from "../../../../components/modals/NewCustomerModal/NewCustomerModal";

export default function DashboardSMS(props) {

    const [value, loading, error] = useCollectionData(
        query(collection(FirebaseClient.db(), 'sms_messages'), orderBy("sent_at", "desc")),
        {
            snapshotListenOptions: {includeMetadataChanges: true},
        }
    );

    const [searchVal, setSearchVal] = useState("");

    useEffect(() => {},  [searchVal])

    useEffect(() => {
        if (error) {
            toaster.push(
                <ConfirmModal title={"Database Error"} hideCancel={true}>
                    <p><FontAwesomeIcon icon={faExclamationTriangle} color={"red"}/> Warning:
                         {" " + error.message}
                    </p>
                </ConfirmModal>
            )
        }
    }, [error])

    const tableData = () => {
        let added = []
        let texts = []

        if (!value) return [];

        value.forEach((txt) => {
            if (!added.includes(txt.receiver)) {
                texts.push({...txt, sent_at: txt.sent_at.toDate()})
                added.push(txt.receiver)
            }
        });

        if (searchVal) {
            const searchVals = ["receiver"];

            const results = texts.filter((client) => {
                let match = false;

                searchVals.forEach((key) => {
                    if (client[key]) {
                        if (client[key].toLowerCase().includes(searchVal.toLowerCase())) {
                            match = true;
                        }
                    }
                })

                return match;
            });

            return results;
        }

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

    const DateCell = ({rowData, dataKey, ...props}) => (
        <Table.Cell {...props}>
            <span>{rowData["sent_at"].toLocaleString().replace(", ", " @ ")}</span>
        </Table.Cell>
    );

    return (
        <div style={{height: '80vh'}}>
            <div style={{ margin: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <InputSearch onChange={(value) => setSearchVal(value)} disabled={loading || error} />
                <Button type={"button"} className={'btn-round'} onClick={() => toaster.push(<AuthProvider><NewTextModal /></AuthProvider>)}><FontAwesomeIcon icon={faPlus} /></Button>
            </div>
            <FullWidthTable data={() => tableData()} className={`m-4`} loading={loading} fillHeight={true}>
                <Table.Column width={60} align="center">
                    <Table.HeaderCell>{""}</Table.HeaderCell>
                    <DeleteCell/>
                </Table.Column>
                <Table.Column width={200} align="center" resizable>
                    <Table.HeaderCell>Recipient</Table.HeaderCell>
                    <RecipientCell dataKey="receiver"/>
                </Table.Column>

                <Table.Column width={500} resizable>
                    <Table.HeaderCell>Message</Table.HeaderCell>
                    <Table.Cell dataKey="message"/>
                </Table.Column>
                <Table.Column width={200}>
                    <Table.HeaderCell>Date/Time</Table.HeaderCell>
                    <DateCell />
                </Table.Column>
            </FullWidthTable>
        </div>
    )

}