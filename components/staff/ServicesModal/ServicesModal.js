import styles from './styles.module.css';
import React, {useState} from "react";
import {useAuth} from "../../../context/AuthContext";
import {Button, Checkbox, Loader, Modal, Notification, toaster} from "rsuite";
import {APIConnector} from "../../APIConnector";
import {useCollectionData} from "react-firebase-hooks/firestore";
import {collection, orderBy, query, where} from "firebase/firestore";
import {FirebaseClient} from "../../../utils/firebase/FirebaseClient";

export default function ServicesModal(props) {

    const [visible, setVisible] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [triggerRender, setTriggerRender] = useState(false);
    const [services, setServices] = useState(props?.staff?.services || []);
    const {currentUser} = useAuth();

    const [value, loading, error] = useCollectionData(
        query(collection(FirebaseClient.db(), 'clover_inventory'), where("bookable", "==", true)),
        {
            snapshotListenOptions: {includeMetadataChanges: true},
        }
    );


    const updateServices = async () => {
        setSubmitted(true);
        try {
            await FirebaseClient.update("staff", props.staff.doc_id, {
                services
            });
            await props.refreshStaff();
            setVisible(false);
        } catch (error) {

            toaster.push(<Notification type={"error"} header={"Failed to update staff account."}/>, {
                placement: 'topEnd'
            });
            console.error(error);

            setSubmitted(false);
        }
    }

    const renderServices = () => {
        if (loading) {
            return <Loader content="Loading..." />
        }
        return value.map((service) => {
            return (
                <div className={styles.service} key={service.id}>
                    <Checkbox defaultChecked={services.includes(service.id)} onChange={(valueType, checked) => {
                        if (checked) {
                            if (!services.includes(service.id)) {
                                services.push(service.id);
                                setServices(services);
                            }
                        } else {
                            setServices((oldServices) => oldServices.filter((s) => s !== service.id));
                        }
                    }}> {service.name}</Checkbox>
                </div>
            )
        })
    }

    return (

        <Modal open={visible} onClose={() => setVisible(false)} backdrop={"static"} size={"lg"}>
            <Modal.Header>
                <div className={`d-flex align-items-center`} style={{gap: '1rem'}}>
                    <Modal.Title style={{width: 'auto'}}>{props.staff.firstname} {props.staff.lastname}&apos;s
                        Authorized Services</Modal.Title>
                </div>
            </Modal.Header>
            <Modal.Body style={{overflow: 'hidden', display: 'flex'}}>
                <div className={styles.body}>
                    {renderServices()}
                </div>
            </Modal.Body>
            <Modal.Footer style={{height: '56px'}}>
                <br/>
                <Button onClick={updateServices} appearance="primary" disabled={loading} loading={submitted}>
                    Save
                </Button>
                <Button onClick={() => setVisible(false)} appearance="subtle">
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    )

}