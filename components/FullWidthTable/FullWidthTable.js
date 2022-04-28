import styles from './styles.module.css';
import {Table} from "rsuite";

export default function FullWidthTable(props) {

    return (
        <Table data={props.data} className={props.className + ` ${styles.table}`} style={props.style} loading={props.loading} rowHeight={props.rowHeight} fillHeight={props.fillHeight}>
            {props.children}
        </Table>
    )

}