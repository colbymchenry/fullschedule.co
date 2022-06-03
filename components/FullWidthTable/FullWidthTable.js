import styles from './styles.module.css';
import {Pagination, Table} from "rsuite";
import {useEffect, useState} from "react";

export default function FullWidthTable(props) {

    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);

    const handleChangeLimit = dataKey => {
        setPage(1);
        setLimit(dataKey);
    };

    const data = () => props.data.filter((v, i) => {
        const start = limit * (page - 1);
        const end = start + limit;
        return i >= start && i < end;
    });

    useEffect(() => {
        if (page !== 1) {
            setPage(1);
        }
    }, [props.data])

    return (
        <>
        <Table data={props?.paginate ? data : props.data} className={props.className + ` ${styles.table}`} style={props.style} loading={props.loading} rowHeight={props.rowHeight} fillHeight={props.fillHeight} bordered>
            {props.children}
        </Table>
            {props?.paginate ?
            <div style={{ padding: 20 }}>
                <Pagination
                    prev
                    next
                    first
                    last
                    ellipsis
                    boundaryLinks
                    maxButtons={5}
                    size="xs"
                    layout={['total', '-', 'limit', '|', 'pager', 'skip']}
                    total={props.data.length}
                    limitOptions={[10, 20]}
                    limit={limit}
                    activePage={page}
                    onChangePage={setPage}
                    onChangeLimit={handleChangeLimit}
                />
            </div>
                : <></>}
        </>
    )

}