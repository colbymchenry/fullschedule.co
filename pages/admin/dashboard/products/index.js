import React, {useEffect, useState} from "react";
import {APIConnector} from "../../../../components/APIConnector";
import {Button, Input, InputGroup, Notification, SelectPicker, Table, toaster} from "rsuite";
import {AuthProvider, useAuth} from "../../../../context/AuthContext";
import styles from "../staff/styles.module.css";
import FullWidthTable from "../../../../components/FullWidthTable/FullWidthTable";
import {InputSearch} from "../../../../components/inputs/InputSearch";
import {ToggleCell} from "../../../../components/CustomCells/ToggleCell";
import StaffModal from "../../../../components/staff/StaffModal/StaffModal";
import NewProductModal from "../../../../components/modals/NewProductModal/NewProductModal";

export default function DashboardProducts(props) {

    const { currentUser } = useAuth();
    const moneyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    const [inventory, setInventory] = useState(null);
    const [filteredData, setFilteredData] = useState(null);
    const [editingPriceId, setEditingPriceId] = useState(null);
    const [editingNameId, setEditingNameId] = useState(null);
    const [editingCategoryId, setEditingCategoryId] = useState(null);

    const fetchInventory = async () => {
        setInventory(null);
        setFilteredData(null);
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
        if (!id) return;

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
            return true;
        } catch (error) {
            toaster.push(<Notification type={"error"} header={error?.response?.data?.message || "Failed server error. Please try again."}/>, {
                placement: 'topEnd'
            });
        }

        return false;
    }

    const updatePrice = async (id, value) => {
        if (!id || !value) return;

        try {
            await (await APIConnector.create(4000, currentUser)).post(`/clover/price?id=${id}`, {
                price: parseFloat(value) * 100
            });

            const newInventory = inventory.map((item) => {
                if (item.doc_id === id) {
                    item["price"] = parseFloat(value) * 100;
                }

                return item;
            });

            const newFilteredData = filteredData.map((item) => {
                if (item.doc_id === id) {
                    item["price"] = parseFloat(value) * 100;
                }

                return item;
            });

            setInventory(newInventory);
            setFilteredData(newFilteredData);
            setEditingPriceId(null);
        } catch (error) {
            toaster.push(<Notification type={"error"} header={error?.response?.data?.message || "Failed server error. Please try again."}/>, {
                placement: 'topEnd'
            });
        }
    }

    const updateName = async (id, value) => {
        if (!id || !value) return;

        try {
            await (await APIConnector.create(4000, currentUser)).post(`/clover/name?id=${id}`, {
                name: value
            });

            const newInventory = inventory.map((item) => {
                if (item.doc_id === id) {
                    item["name"] = value;
                }

                return item;
            });

            const newFilteredData = filteredData.map((item) => {
                if (item.doc_id === id) {
                    item["name"] = value;
                }

                return item;
            });

            setInventory(newInventory);
            setFilteredData(newFilteredData);
            setEditingNameId(null);
        } catch (error) {
            toaster.push(<Notification type={"error"} header={error?.response?.data?.message || "Failed server error. Please try again."}/>, {
                placement: 'topEnd'
            });
        }
    }

    const updateCategory = async (id, value) => {
        if (!id || !value) return;
        try {
            await (await APIConnector.create(4000, currentUser)).post(`/clover/category?id=${editingCategoryId}`, {
                categoryId: id,
                categoryName: value.label
            });

            const newInventory = inventory.map((item) => {
                if (item.doc_id === editingCategoryId) {
                    if (!item?.categories?.elements) {
                        item["categories"] = {
                            elements: [
                                {
                                    id: id,
                                    name: value.label
                                }
                            ]
                        }
                    } else {
                        item["categories"]["elements"] = [
                            {
                                id: id,
                                name: value.label
                            }
                        ];
                    }
                }

                return item;
            });

            const newFilteredData = filteredData.map((item) => {
                if (item.doc_id === editingCategoryId) {
                    if (!item?.categories?.elements) {
                        item["categories"] = {
                            elements: [
                                {
                                    id: id,
                                    name: value.label
                                }
                            ]
                        }
                    } else {
                        item["categories"]["elements"] = [
                            {
                                id: id,
                                name: value.label
                            }
                        ];
                    }
                }

                return item;
            });

            setInventory(newInventory);
            setFilteredData(newFilteredData);
            setEditingCategoryId(null);
        } catch (error) {
            console.error(error)
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
            {editingNameId === rowData["doc_id"] ? (
                <NameInput value={rowData["name"]} id={rowData["doc_id"]} updateName={updateName} />
            ) : (
                <p style={!rowData['available'] ? { textDecoration: "line-through", color: 'gray' } : {}} onClick={() => {
                    if (rowData['available']) {
                        setEditingNameId(rowData["doc_id"]);
                    }
                }}>{rowData['name']}</p>
            )}

        </Table.Cell>
    );


    const CategoryCell = ({rowData, dataKey, ...props}) => (
        <Table.Cell {...props}>
            {editingCategoryId === rowData["doc_id"] ? (
                <CategorySelection inventory={inventory} value={rowData["name"]} id={rowData["doc_id"]} updateCategory={updateCategory} />
            ) : (
                rowData["categories"] && rowData["categories"]["elements"] && rowData["categories"]["elements"].length ?
                    (
                        <p style={!rowData['available'] ? { textDecoration: "line-through", color: 'gray' } : {}} onClick={() => {
                            if (rowData['available']) {
                                setEditingCategoryId(rowData["doc_id"]);
                            }
                        }}>{rowData["categories"]["elements"][0]["name"]}</p>
                    )
                    : <p style={!rowData['available'] ? { textDecoration: "line-through", color: 'gray' } : {}} onClick={() => {
                        if (rowData['available']) {
                            setEditingCategoryId(rowData["doc_id"]);
                        }
                    }}>N/A</p>
            )}
        </Table.Cell>
    );

    const PriceCell = ({rowData, dataKey, ...props}) => (
        <Table.Cell {...props}>
            {rowData["price"] ?
                editingPriceId === rowData["doc_id"] ? (
                       <PriceInput value={parseInt(rowData["price"]) / 100} id={rowData["doc_id"]} updatePrice={updatePrice} />
                    )
                    : (
                    <p style={!rowData['available'] ? { textDecoration: "line-through", color: 'gray' } : {}} onClick={() => {
                        if (rowData['available']) {
                            setEditingPriceId(rowData["doc_id"]);
                        }
                    }}>{moneyFormatter.format(parseInt(rowData["price"]) / 100)}</p>
                )
                : <p style={!rowData['available'] ? { textDecoration: "line-through", color: 'gray' } : {}}>N/A</p>
            }
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
                <InputSearch onChange={search} disabled={!inventory} />
            </div>
            <FullWidthTable data={filteredData || []} className={`m-4`} loading={!filteredData} fillHeight={true} pageLimit={true}>
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
                    <ToggleCell cellKey={"bookable"} disabledKey={"available"} onChange={(rowData)=> {
                        changeBookable(rowData["doc_id"]);
                    }} />
                </Table.Column>
            </FullWidthTable>
            <Button appearance="primary" onClick={() => toaster.push(<AuthProvider><NewProductModal
                fetchInventory={fetchInventory}/></AuthProvider>)} className={'save-button'}>New Product</Button>
        </div>
    )

}

const NameInput = (props) => {
    const [value, setValue] = useState(props.value);
    const [disabled, setDisabled] = useState(false);

    return (
        <InputGroup inside style={{ marginTop: "-0.5rem" }}>
            <Input type={"text"} value={value} disabled={disabled} onChange={(val) => setValue(val)} onBlur={async () => {
                setDisabled(true);
                await props.updateName(props.id, value)
                setDisabled(false);
            }} />
        </InputGroup>
    )
}

const PriceInput = (props) => {
    const [value, setValue] = useState(props.value);
    const [disabled, setDisabled] = useState(false);

    return (
        <InputGroup inside style={{ marginTop: "-0.5rem" }}>
            <InputGroup.Addon>$</InputGroup.Addon>
            <Input type={"tel"} value={value} disabled={disabled} onChange={(val) => setValue(val)} onBlur={async () => {
                setDisabled(true);
                await props.updatePrice(props.id, value)
                setDisabled(false);
            }} />
        </InputGroup>
    )
}

const CategorySelection = (props) => {
    const data = () => {
        const array = [];
        props.inventory.forEach((item) => {
            if (item?.categories?.elements) {
                item.categories.elements.forEach((categoryElem) => {
                    if (!(array.filter((cat) => cat.value === categoryElem.id).length)) {
                        array.push({
                            value: categoryElem.id,
                            label: categoryElem.name
                        })
                    }
                })
            }
        })

        return array;
    }

    return <SelectPicker data={data()} style={{ width: 224, marginTop: '-0.5rem' }} onSelect={props.updateCategory}/>
}