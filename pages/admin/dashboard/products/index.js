import React, {useEffect, useState} from "react";
import {APIConnector} from "../../../../components/APIConnector";
import {Input, InputGroup, Notification, Table, toaster, Toggle} from "rsuite";
import {useAuth} from "../../../../context/AuthContext";
import styles from "../staff/styles.module.css";
import FullWidthTable from "../../../../components/FullWidthTable/FullWidthTable";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faSearch} from "@fortawesome/free-solid-svg-icons";
import {SearchBar} from "rsuite/Picker";
import {InputSearch} from "../../../../components/inputs/InputSearch";

export default function DashboardProducts(props) {

    const { currentUser } = useAuth();
    const moneyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    const [inventory, setInventory] = useState(null);
    const [filteredData, setFilteredData] = useState(null);
    const [searchVal, setSearchVal] = useState("");

    const fetchInventory = async () => {
        try {
            const res = await (await APIConnector.create(10000, currentUser)).get(`/clover/inventory`);
            if (res.data["products"] && res.data["products"].length) {
                setInventory(res.data["products"].filter((staff) => Object.keys(staff).length > 2));
                setFilteredData(res.data["products"].filter((staff) => Object.keys(staff).length > 2))
            }
        } catch (error) {
            toaster.push(<Notification type={"error"} header={"Failed to get inventory from Clover."}/>, {
                placement: 'topEnd'
            });
        }
    }

    const changeBookable = async (id) => {
        try {
            const res = await (await APIConnector.create(4000, currentUser)).get(`/clover/bookable?id=${id}`);
            const newInventory = inventory.map((item) => {
                if (item.doc_id === id) {
                    item["bookable"] = res.data.bookable;
                }

                return item;
            });

            const newFilteredData = filteredData.map((item) => {
                if (item.doc_id === id) {
                    item["bookable"] = res.data.bookable;
                }

                return item;
            });

            setInventory(newInventory);
            setFilteredData(newFilteredData);
        } catch (error) {
            toaster.push(<Notification type={"error"} header={error?.response?.data?.message || "Failed server error. Please try again."}/>, {
                placement: 'topEnd'
            });
        }
    }

    useEffect(() => {
        if (!inventory) {
            fetchInventory();
        }
    }, [])


    const NameCell = ({rowData, dataKey, ...props}) => (
        <Table.Cell {...props}>
            <p style={!rowData['available'] ? { textDecoration: "line-through", color: 'gray' } : {}}>{rowData['name']}</p>
        </Table.Cell>
    );


    const CategoryCell = ({rowData, dataKey, ...props}) => (
        <Table.Cell {...props}>
            {rowData["categories"] && rowData["categories"]["elements"] && rowData["categories"]["elements"].length ?
                (
                    <p style={!rowData['available'] ? { textDecoration: "line-through", color: 'gray' } : {}}>{rowData["categories"]["elements"][0]["name"]}</p>
                )
                : <p style={!rowData['available'] ? { textDecoration: "line-through", color: 'gray' } : {}}>N/A</p>
            }
        </Table.Cell>
    );

    const PriceCell = ({rowData, dataKey, ...props}) => (
        <Table.Cell {...props}>
            {rowData["price"] ?
                (
                    <p style={!rowData['available'] ? { textDecoration: "line-through", color: 'gray' } : {}}>{moneyFormatter.format(parseInt(rowData["price"]) / 100)}</p>
                )
                : <p style={!rowData['available'] ? { textDecoration: "line-through", color: 'gray' } : {}}>N/A</p>
            }
        </Table.Cell>
    );

    const BookableCell = ({rowData, dataKey, ...props}) => (
        <Table.Cell {...props}>
            <Toggle checked={rowData['bookable']} disabled={!rowData['available']} onChange={() => changeBookable(rowData["doc_id"])} />
        </Table.Cell>
    );

    const search = (val) => {
        if (!val) {
            setFilteredData(inventory)
            return;
        }
        const results = inventory.filter((product) => product.name.toLowerCase().includes(val.toLowerCase()));
        setFilteredData(results);
    }

    return (
        <div className={styles.table}>
            <div style={{ margin: '1.5rem' }}>
                <InputSearch onChange={search} disabled={!filteredData} />
            </div>
            <FullWidthTable data={filteredData || []} className={`m-4`} loading={!filteredData} fillHeight={true}>
                <Table.Column width={300} align="left" resizable>
                    <Table.HeaderCell>{"Name"}</Table.HeaderCell>
                    <NameCell />
                </Table.Column>
                <Table.Column width={300} align="center" resizable>
                    <Table.HeaderCell>{"Category"}</Table.HeaderCell>
                    <CategoryCell />
                </Table.Column>
                <Table.Column width={100} align="center">
                    <Table.HeaderCell>{"Price"}</Table.HeaderCell>
                    <PriceCell />
                </Table.Column>
                <Table.Column width={100} align={"center"}>
                    <Table.HeaderCell>{"Bookable"}</Table.HeaderCell>
                    <BookableCell />
                </Table.Column>
            </FullWidthTable>
        </div>
    )

}