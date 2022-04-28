import React from "react";
import InputMask from "react-input-mask";

export const MaskedInput = React.forwardRef(({onChange, ...rest}, ref) => (
    <InputMask
        {...rest}
        inputRef={ref}
        className="rs-input"
        onChange={event => {
            onChange(event.target.value);
        }}
    />
));

MaskedInput.displayName = "MaskedInput";
