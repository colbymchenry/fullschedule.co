import {Input, InputGroup} from "rsuite";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSearch} from "@fortawesome/free-solid-svg-icons";
import React, {useState} from "react";

export function InputSearch(props) {

    const [searchVal, setSearchVal] = useState("");

    return (
        <InputGroup inside>
            <Input placeholder={"Search"} value={searchVal} onChange={(val) => {
                setSearchVal(val);
                if (props?.onChange) {
                    props.onChange(val);
                }
            }}/>
            <InputGroup.Button>
                <FontAwesomeIcon icon={faSearch} />
            </InputGroup.Button>
        </InputGroup>
    )
}