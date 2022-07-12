import {useState} from "react";
import {Button, Drawer, Form, Nav} from "rsuite";
import styles from './styles.module.css';
import {HomeTab} from "./HomeTab";


export default function CustomerModal({customer}) {

    const [activeTab, setActiveTab] = useState('home');
    const [open, setOpen] = useState(true);
    const [loading, setLoading] = useState(false);

    const CustomNav = ({ active, onSelect, ...props }) => {
        return (
            <Nav {...props} activeKey={active} onSelect={onSelect} style={styles}>
                <Nav.Item eventKey="home">Personal Information</Nav.Item>
                <Nav.Item eventKey="history">History</Nav.Item>
                <Nav.Item eventKey="notes">Notes</Nav.Item>
            </Nav>
        );
    };

    return (
        <Drawer placement={'right'} open={open} onClose={() => setOpen(false)}>
            <Drawer.Header>
                <Drawer.Title>{customer.firstName} {customer.lastName}</Drawer.Title>
                <Drawer.Actions>
                    <Button appearance="primary" color={"red"} loading={loading}>
                        Delete
                    </Button>
                </Drawer.Actions>
            </Drawer.Header>
            <Drawer.Body>
                <CustomNav appearance="tabs" reversed active={activeTab} onSelect={setActiveTab} className={styles.nav} />
                {activeTab === 'home' ? <HomeTab customer={customer} /> : activeTab === 'history' ?
                        (
                            <>
                            </>
                        ) :
                        (
                            <>
                            </>
                        )
                }

            </Drawer.Body>
        </Drawer>
    )

}

