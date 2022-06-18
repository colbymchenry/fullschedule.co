import React, {useState} from "react";
import {Button, Modal} from "rsuite";

export default function ConfirmModal(props) {

    const [visible, setVisible] = useState(true);
    const [submitted, setSubmitted] = useState(false);

    const submitForm = async () => {
        setSubmitted(true);

        try {
            if (props.onConfirm) {
                if (!await props.onConfirm()) {
                    setSubmitted(false);
                    return;
                }
            }
            setVisible(false);
        } catch (error) {
            console.error(error);
            setSubmitted(false);
        }
    }

    return (
        <Modal open={"open" in props ? props.open : visible} onClose={() => {
            setVisible(false)
            if (props.handleClose) props.handleClose()
        }} backdrop={"static"}>
            <Modal.Header>
                <Modal.Title>{props.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {props.children}
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={submitForm} appearance="primary" loading={submitted} disabled={props.disableConfirm || false}>
                    {props.confirmText || "Ok"}
                </Button>
                {!props.hideCancel &&
                    <Button onClick={() => {
                        setVisible(false)
                        if (props.handleClose) props.handleClose()
                    }} appearance="subtle">
                        {props.cancelText || "Cancel"}
                    </Button>
                }
            </Modal.Footer>
        </Modal>
    )

}