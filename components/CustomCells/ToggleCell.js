import {Table, Toggle} from "rsuite";
import React, {useState} from "react";

export const ToggleCell = ({rowData, dataKey, ...props}) => {

    const [checked, setChecked] = useState(rowData[props["cellKey"]]);
    const [disabled, setDisabled] = useState(false);


    return (
        <Table.Cell {...props} onChange={async () => {
            setDisabled(true);
            setChecked(!checked);

            if (props["onChange"]) {
                if (!await props.onChange(rowData)) {
                    setChecked(!checked);
                }
            }
            setDisabled(props["disabled"] || false);
        }}>
            <Toggle checked={checked} disabled={props["disabledKey"] ? !rowData[props["disabledKey"]] : disabled} />
        </Table.Cell>
    );
}
