import styles from "./styles.module.css"
import React, {useRef, useState} from "react";
import {useAuth} from "../../../context/AuthContext";
import {
    Button,
    Form,
    Loader,
    Message,
    Modal,
    Notification,
    Schema,
    SelectPicker,
    toaster,
    Uploader
} from "rsuite";
import {previewFile} from "rsuite/utils";
import {AvatarSVG} from "../../SVG";
import {APIConnector} from "../../APIConnector";
import {Field} from "../../inputs/Field";
import {MaskedInput} from "../../inputs/MaskedInput";

const {StringType} = Schema.Types;

export default function StaffModal(props) {

    const [open, setOpen] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [formValue, setFormValue] = useState(props.staff || {});
    const [formError, setFormError] = useState({});
    const [uploading, setUploading] = useState(false);
    const [fileInfo, setFileInfo] = useState(props.staff && props.staff.avatar ? props.staff.avatar : null);
    const submitRef = useRef();
    const {currentUser} = useAuth();

    const handleClose = () => {
        setOpen(false);
        props.refreshStaff();
    }

    const submitForm = async (passed) => {
        if (!passed) return;
        setSubmitted(true);
        try {
            const createRes = await (await APIConnector.create(2000, currentUser)).post(`/staff/${props.staff ? "update" : "create"}`, props.staff ? {...formValue, id: props.staff.doc_id} : formValue);

            if ((fileInfo && !props.staff) || (fileInfo && props.staff && props.staff.avatar !== fileInfo)) {
                const formData = new FormData();

                formData.append('file', fileInfo);
                formData.append('upload_preset', 'my-uploads');

                const imgUploadData = await fetch('https://api.cloudinary.com/v1_1/dfpldejtd/image/upload', {
                    method: 'POST',
                    body: formData
                }).then(r => r.json());

                await (await APIConnector.create(2000, currentUser)).post(`/staff/avatar`, {
                    uid: props.staff ? props.staff.uid : createRes.data.uid,
                    photoURL: imgUploadData.secure_url
                });
            }


            toaster.push(<Notification type={"success"} header={"Staff account created!"}/>, {
                placement: 'topEnd'
            });
            handleClose();
        } catch (error) {
            if (error?.response?.data?.code === 'auth/email-already-exists') {
                formError["email"] = error?.response?.data.message;
            } else if (error?.response?.data?.code === 'auth/invalid-password') {
                formError["password"] = error?.response?.data.message;
            } else {
                toaster.push(<Notification type={"error"} header={"Failed to create staff account."}/>, {
                    placement: 'topEnd'
                });
                console.error(error);
            }

            setFormError(formError);
            setSubmitted(false);
        }
    }

    const model = Schema.Model({
        ...(!props.staff && {password: StringType().isRequired('This field is required.')}),
        email: StringType()
            .isEmail('Please enter a valid email address.')
            .isRequired('This field is required.'),
        firstname: StringType().isRequired('This field is required.'),
        lastname: StringType().isRequired('This field is required.')
    });

    return (
        <Modal open={open} onClose={handleClose} backdrop={"static"}>
            <Modal.Header>
                <Modal.Title>{props.staff ? "Modifying Staff Account" : "New Staff Account"}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{overflow: 'visible'}}>
                <Form className={styles.form} formValue={formValue} onSubmit={submitForm} onChange={formValue => {
                    setFormValue(formValue);
                    if (Object.keys(formError).length) setFormError({});
                }} model={model} disabled={submitted} readOnly={submitted}>

                    <div className={`d-flex mb-5 w-100 justify-content-center align-items-center`}>
                        <Uploader
                            fileListVisible={false}
                            listType="picture"
                            action={"#"}
                            onUpload={file => {
                                setUploading(true);
                                previewFile(file.blobFile, value => {
                                    setFileInfo(value);
                                });
                            }}
                            onSuccess={(response, file) => {
                                setUploading(false);
                                toaster.push(<Message type="success">Uploaded successfully</Message>);
                            }}
                            onError={(e) => {
                                setFileInfo(null);
                                setUploading(false);
                                console.error(e)
                                toaster.push(<Message type="error">Upload failed</Message>);
                            }}
                        >
                            <button type="button" style={{width: 150, height: 150, borderRadius: '50%'}}>
                                {uploading && <Loader backdrop center/>}
                                {fileInfo ? (
                                    <img src={fileInfo} alt="avatar" width="100%" height="100%"
                                         style={{borderRadius: '50%'}}/>
                                ) : (
                                    <AvatarSVG style={{width: '50%', height: '50%'}}/>
                                )}
                            </button>
                        </Uploader>
                    </div>

                    <div className={styles.section}>
                        <Field
                            name="firstname"
                            label="First Name"
                            message={"Required"}
                            accepter={MaskedInput}
                            error={formError["firstname"]}
                        />

                        <Field
                            name="lastname"
                            label="Last Name"
                            message={"Required"}
                            accepter={MaskedInput}
                            error={formError["lastname"]}
                        />

                        <Field
                            name="email"
                            label="Email"
                            type={"email"}
                            message={"Required"}
                            accepter={MaskedInput}
                            error={formError["email"]}
                        />

                        {!props.staff && <Field
                            name="password"
                            label="Password"
                            type={"password"}
                            message={"Required"}
                            accepter={MaskedInput}
                            error={formError["password"]}
                        />}
                    </div>
                    <button ref={submitRef} type={"submit"} style={{display: 'none'}}/>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => submitRef.current.click()} appearance="primary" loading={submitted}>
                    {props.staff ? "Update" : "Create"}
                </Button>
                <Button onClick={handleClose} appearance="subtle">
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    )

}