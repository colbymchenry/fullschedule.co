import {Input, InputGroup} from "rsuite";
import {faEye, faEyeSlash} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import React, {useEffect, useState} from "react";

export const InputPassword = React.forwardRef(({onChange, ...rest}, ref) => {
    const [visible, setVisible] = React.useState(false);

    const handleChange = () => {
        setVisible(!visible);
    };

    return (
        <InputGroup inside>
            <Input inputRef={ref} type={visible ? 'text' : 'password'} onChange={value => {
                onChange(value);
            }} {...rest} />
            <InputGroup.Button onClick={handleChange}>
                {visible ? <FontAwesomeIcon icon={faEye} /> : <FontAwesomeIcon icon={faEyeSlash} />}
            </InputGroup.Button>
        </InputGroup>
    );
});

InputPassword.displayName = "InputPassword";
