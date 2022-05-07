import React, {useState} from "react";
import {Button, Form, Modal} from "rsuite";

export default function ConfirmModal(props) {

    const [visible, setVisible] = useState(true);
    const [submitted, setSubmitted] = useState(false);

    const submitForm = async () => {
        setSubmitted(true);

        try {
            if (props.onConfirm) await props.onConfirm();
            setVisible(false);
        } catch (error) {
            console.error(error);
            setSubmitted(false);
        }
    }

    return (
        <Modal open={visible} onClose={() => setVisible(false)} backdrop={"static"}>
            <Modal.Header>
                <Modal.Title>{props.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {props.children}
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={submitForm} appearance="primary" loading={submitted}>
                    {props.confirmText || "Ok"}
                </Button>
                {!props.hideCancel &&
                    <Button onClick={() => setVisible(false)} appearance="subtle">
                        {props.cancelText || "Cancel"}
                    </Button>
                }
            </Modal.Footer>
        </Modal>
    )

}