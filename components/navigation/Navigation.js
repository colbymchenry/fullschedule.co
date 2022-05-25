import React from "react";
import Link from "next/link";
import {Button, Nav, Sidenav, toaster} from "rsuite";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
    faCalendarAlt, faChartBar,
    faCog, faExclamationTriangle, faGift,
    faSms,
    faSyringe, faTabletAlt,
    faUserMd,
    faUsers
} from '@fortawesome/free-solid-svg-icons'
import {useRouter} from "next/router";
import styles from './styles.module.css';
import {useAuth} from "../../context/AuthContext";
import ConfirmModal from "../modals/ConfirmModal/ConfirmModal";
import {ActionItems} from "./ActionItems";

export default function Navigation(props) {

    const router = useRouter();
    const {logout} = useAuth();

    const NavLink = React.forwardRef((props, ref) => {
        const {as, href, ...rest} = props;
        return (
            <Link href={href} as={as}>
                <a ref={ref} {...rest} />
            </Link>
        );
    });

    NavLink.displayName = "NavLink";

    return (
        <>
            <div style={{width: 240, height: "100vh"}}>

            </div>
            <div style={{width: 240, height: "100vh", position: "fixed"}}>
                <Sidenav defaultOpenKeys={['3', '4']} style={{height: "100%"}}>
                    <Sidenav.Body>
                        <div className={`d-flex w-100`} style={{padding: '1rem 0', marginLeft: '1rem'}}><h4>Full
                            Schedule</h4></div>
                        <Nav activeKey={router.pathname}>
                            <Nav.Item as={NavLink} href="/admin/dashboard" eventKey="/admin/dashboard"
                                      icon={<FontAwesomeIcon icon={faCalendarAlt}/>}>
                                Appointments
                            </Nav.Item>
                            <Nav.Item as={NavLink} href="/admin/dashboard/sms" eventKey="/admin/dashboard/sms"
                                      icon={<FontAwesomeIcon icon={faSms}/>}>
                                SMS Messages
                            </Nav.Item>
                            <Nav.Item as={NavLink} href="/admin/dashboard/clients" eventKey="/admin/dashboard/clients"
                                      icon={<FontAwesomeIcon icon={faUsers}/>}>
                                Clients
                            </Nav.Item>
                            <Nav.Item as={NavLink} href="/admin/dashboard/staff" eventKey="/admin/dashboard/staff"
                                      icon={<FontAwesomeIcon icon={faUserMd}/>}>
                                Staff
                            </Nav.Item>
                            <Nav.Item as={NavLink} href="/admin/dashboard/products" eventKey="/admin/dashboard/products"
                                      icon={<FontAwesomeIcon icon={faSyringe}/>}>
                                Products
                            </Nav.Item>
                            <Nav.Item as={NavLink} href="/admin/dashboard/analytics"
                                      eventKey="/admin/dashboard/analytics"
                                      icon={<FontAwesomeIcon icon={faChartBar}/>}>
                                Analytics
                            </Nav.Item>
                            <Nav.Item as={NavLink} href="/admin/dashboard/promotions"
                                      eventKey="/admin/dashboard/promotions"
                                      icon={<FontAwesomeIcon icon={faGift}/>}>
                                Promotions
                            </Nav.Item>
                            <Nav.Item as={NavLink} href="/admin/dashboard/clover-devices"
                                      eventKey="/admin/dashboard/clover-devices"
                                      icon={<FontAwesomeIcon icon={faTabletAlt}/>}>
                                Clover Devices
                            </Nav.Item>
                            <Nav.Item as={NavLink} href="/admin/dashboard/settings" eventKey="/admin/dashboard/settings"
                                      icon={<FontAwesomeIcon icon={faCog}/>}>
                                Settings
                            </Nav.Item>

                           <ActionItems />

                        </Nav>
                    </Sidenav.Body>
                    <Button onClick={() => logout()} className={styles.logout}>Logout</Button>
                </Sidenav>
            </div>
        </>
    )

}