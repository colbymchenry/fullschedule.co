import React from "react";
import {Form} from "rsuite";

export const Field = React.forwardRef((props, ref) => {
    const {name, message, label, accepter, error, ...rest} = props;
    return (
        <Form.Group ref={ref} className={error ? 'has-error' : ''}>
            {label && <Form.ControlLabel>{label} </Form.ControlLabel>}
            <Form.Control name={name} accepter={accepter} errorMessage={error} {...rest} />
            {message && <Form.HelpText>{message}</Form.HelpText>}
        </Form.Group>
    );
});

Field.displayName = "Field";