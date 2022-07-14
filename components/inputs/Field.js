import React from "react";
import {Form} from "rsuite";

export const Field = React.forwardRef((props, ref) => {
    const {name, message, label, accepter, error, children, ...rest} = props;
    return (
        <Form.Group ref={ref} className={(props?.className ? props.className + ' ' : '') + (error ? 'has-error' : '')}>
            {label && <Form.ControlLabel htmlFor={name} style={{ cursor: 'pointer' }}>{label} </Form.ControlLabel>}
            <Form.Control name={name} id={name} accepter={accepter} errorMessage={error} {...rest} />
            {message && <Form.HelpText>{message}</Form.HelpText>}
            {props.children}
        </Form.Group>
    );
});

Field.displayName = "Field";