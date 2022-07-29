import {Table, Toggle} from "rsuite";
import React, {useState} from "react";

export const ToggleCell = ({rowData, dataKey, ...props}) => {

    const [disabled, setDisabled] = useState(false);

    return (
        <Table.Cell {...props}>
            <Toggle checked={rowData[props["cellKey"]] === true} disabled={props["disabledKey"] ? !rowData[props["disabledKey"]] : disabled} onChange={async (checked) => {
                setDisabled(true);

                if (props["onChange"]) {
                    await props.onChange(rowData, checked)
                } else {
                    // TODO: Revert check
                }
                setDisabled(props["disabled"] || false);
            }} />
        </Table.Cell>
    );
}
