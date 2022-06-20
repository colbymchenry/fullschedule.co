import React, {useEffect, useState} from "react";
import styles from "../staff/styles.module.css";
import {InputSearch} from "../../../../components/inputs/InputSearch";
import FullWidthTable from "../../../../components/FullWidthTable/FullWidthTable";
import {Button, Notification, Table, Tag, toaster} from "rsuite";
import {APIConnector} from "../../../../components/APIConnector";
import {AuthProvider, useAuth} from "../../../../context/AuthContext";
import NewCustomerModal from "../../../../components/modals/NewCustomerModal/NewCustomerModal";
import NewTextModal from "../../../../components/sms/NewTextModal/NewTextModal";
import thisStyles from "./styles.module.css";

export default function DashboardCustomers(props) {

    const { currentUser } = useAuth();
    const [clients, setClients] = useState(null);
    const [filteredData, setFilteredData] = useState(null);

    const getClients = async () => {
        try {
            const res = await (await APIConnector.create(10000, currentUser)).get(`/clover/customers`);
            setFilteredData(res.data);
            setClients(res.data);
        } catch (error) {
            console.error(error);
            toaster.push(<Notification type={"error"} header={"Failed to get customers from Clover."}/>, {
                placement: 'topEnd'
            });
        }
    }

    useEffect(() => {
        if (!clients) {
            (async () => {
                await getClients();
            })();
        }
    }, []);

    const search = (val) => {
        if (!val) {
            setFilteredData(clients)
            return;
        }

        const searchVals = ["firstName", "lastName", "email"];

        const results = clients.filter((client) => {
            let match = false;

            searchVals.forEach((key) => {
                if (client[key]) {
                    if (client[key].toLowerCase().includes(val.toLowerCase())) {
                        match = true;
                    }
                }
            })

            return match;
        });
        setFilteredData(results);
    }

    const NameCell = ({rowData, dataKey, ...props}) => (
        <Table.Cell {...props}>
            {rowData["firstName"]} {rowData["lastName"]}
        </Table.Cell>
    );

    const PhoneCell = ({rowData, dataKey, ...props}) => (
        <Table.Cell {...props}>
            {rowData["phoneNumber"]}
            <button type={"button"} className={thisStyles.phoneButton}
                    onClick={() => toaster.push(
                        <AuthProvider><NewTextModal
                            phone={rowData["phoneNumber"]}/></AuthProvider>)}><Tag
                color="blue">{rowData["phoneNumber"]}</Tag></button>
        </Table.Cell>
    );




    return (
        <div className={styles.table}>
            <div style={{ margin: '1.5rem' }}>
                <InputSearch onChange={search} disabled={!clients} />
            </div>
            <FullWidthTable data={filteredData || []} className={`m-4`} loading={!filteredData} fillHeight={true} paginate={true}>
                <Table.Column width={300} align="left" resizable>
                    <Table.HeaderCell>{"Name"}</Table.HeaderCell>
                    <NameCell />
                </Table.Column>
                <Table.Column width={300} align="center" resizable>
                    <Table.HeaderCell>{"Email"}</Table.HeaderCell>
                    <Table.Cell dataKey={"email"} />
                </Table.Column>
                <Table.Column width={300} align="center">
                    <Table.HeaderCell>{"Phone Number"}</Table.HeaderCell>
                    <PhoneCell />
                </Table.Column>
            </FullWidthTable>
            <Button appearance="primary" type="button" onClick={() => toaster.push(<AuthProvider><NewCustomerModal fetchCustomers={getClients}/></AuthProvider>)} className={'save-button'}>New Client</Button>
        </div>
    )

}