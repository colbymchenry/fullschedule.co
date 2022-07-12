import styles from "./styles.module.css";
import {useCollectionData} from 'react-firebase-hooks/firestore';
import {collection, query, where} from "firebase/firestore";
import {FirebaseClient} from "../../../utils/firebase/FirebaseClient";
import React, {useEffect, useRef, useState} from "react";
import {Button, Form, Input, Loader, Modal, Notification, Schema, toaster} from "rsuite";
import {useAuth} from "../../../context/AuthContext";
import {APIConnector} from "../../APIConnector";
import {Field} from "../../inputs/Field";

const Textarea = React.forwardRef((props, ref) => <Input {...props} as="textarea" ref={ref}/>);

Textarea.displayName = "Textarea";

export default function ConversationModal(props) {

    const [value, loading, error] = useCollectionData(
        query(collection(FirebaseClient.db(), 'sms_messages'), where("receiver", "==", props.receiver || Math.random())),
        {
            snapshotListenOptions: { includeMetadataChanges: true },
        }
    );

    const [visible, setVisible] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [formValue, setFormValue] = useState({});
    const [formError, setFormError] = useState({});
    const submitRef = useRef();
    const { currentUser } = useAuth();
    const {StringType} = Schema.Types;

    const model = Schema.Model({
        message: StringType().isRequired('This field is required.')
    });

    const submitForm = async (valid) => {
        if (!valid) return;

        setSubmitted(true);

        try {
            await (await APIConnector.create(2000, currentUser)).post(`/sms/send`, {...formValue, phone: props.receiver });
        } catch (error) {
            console.error(error);
            toaster.push(<Notification type={"error"} header={"Failed to send text."}/>, {
                placement: 'topEnd'
            });
        }
        setSubmitted(false);
    }

    const renderMessages = () => {
        const sorted = value.sort(function(a,b){
            // Turn your strings into dates, and then subtract them
            // to get a value that is either negative, positive, or zero.
            return a.sent_at.toDate() - b.sent_at.toDate();
        });
        return sorted.map((message, index) => {
            return (
                <div key={message.messageId} className={`d-flex w-100 ${message?.sender ? "justify-content-end" : "justify-content-start"}`}>
                    <div className={`d-flex p-2 m-1 ${message?.sender ? "justify-content-end " + styles.sender : "justify-content-start " + styles.receiver}`} data-tip={message?.username ? `Sent by: @${message.username}` : ''}>
                        {message.message}
                    </div>
                </div>
            )
        })
    }

    const AlwaysScrollToBottom = () => {
        const elementRef = useRef();
        useEffect(() => elementRef.current.scrollIntoView({ behavior: "smooth" }));
        return <div ref={elementRef} />;
    };

    return (
        <Modal open={visible} onClose={() => setVisible(false)} backdrop="static">
            <Modal.Header>
                <Modal.Title>{props.receiver}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ overflow: 'hidden' }}>

                <div className={styles.messages}>
                    {loading ? <Loader content="Loading..." vertical size={"lg"} /> : renderMessages()}
                    <br />
                    <AlwaysScrollToBottom />
                </div>

                <Form className={styles.form} formValue={formValue} onSubmit={submitForm} onChange={formValue => {
                    setFormValue(formValue);
                    if (Object.keys(formError).length) setFormError({});
                }} model={model} disabled={submitted} readOnly={submitted}>
                    <Field
                        name="message"
                        label="Message"
                        accepter={Textarea}
                        className={styles.fullwidth}
                        error={formError["message"]}
                    />
                    <button ref={submitRef} type={"submit"} style={{ display: 'none'}} />
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => submitRef.current.click()} appearance="primary" loading={submitted}>
                    Send
                </Button>
            </Modal.Footer>
        </Modal>
    )


}