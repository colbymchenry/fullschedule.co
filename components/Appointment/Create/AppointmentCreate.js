import styles from './styles.module.css';
import {Calendar, Checkbox, Form, Input, InputGroup, Loader, Notification, toaster} from "rsuite";
import React, {useEffect, useState} from "react";
import {useAuth} from "../../../context/AuthContext";
import ConfirmModal from "../../modals/ConfirmModal/ConfirmModal";
import axios from "axios";
import {TimeHelper} from "../../../utils/TimeHelper";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSearch} from "@fortawesome/free-solid-svg-icons";
import {useCollectionData} from "react-firebase-hooks/firestore";
import {collection, query} from "firebase/firestore";
import {FirebaseClient} from "../../../utils/firebase/FirebaseClient";
import {APIConnector} from "../../APIConnector";

export default function AppointmentCreate(props) {

    const [value, loading, error] = useCollectionData(
        query(collection(FirebaseClient.db(), 'customers')),
        {
            snapshotListenOptions: {includeMetadataChanges: true},
        }
    );

    const [open, setOpen] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [formValue, setFormValue] = useState({});
    const [formError, setFormError] = useState({});
    const [setupData, setSetupData] = useState(null);
    const [timeSlots, setTimeSlots] = useState(null);
    const [date, setDate] = useState(props.date || new Date());
    const [services, setServices] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const {currentUser} = useAuth();

    useEffect(() => {
        if (!setupData) {
            (async () => {
                const res = await axios.get('/api/booking/setup-data');
                setSetupData(res.data);
            })();
        }

        if (!timeSlots) {
            (async () => {
                await fetchTimeSlots();
            })();
        }
    }, []);

    useEffect(() => {
        (async () => {
            await fetchTimeSlots();
        })();
    }, [date]);

    const fetchTimeSlots = async () => {
        setTimeSlots(null);

        const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        let serviceMap = services.map((service) => {
            return {
                doc_id: service
            }
        });

        try {
            const res = await axios.post(`/api/booking/get-available-time-slots`, {
                date,
                day: days[date.getDay()],
                services: serviceMap
            });

            setTimeSlots(res.data);
        } catch (error) {
            toaster.push(<Notification type={"error"}
                                       header={error?.response?.data?.message || "Error connecting to database. Please email, call, or use our live chat to reach us."}/>, {
                placement: 'topEnd'
            });
        }
    }


    const handleClose = () => {
        setOpen(false);
    }

    const submitForm = async () => {
        setSubmitted(true);

        try {
            const res = await (await APIConnector.create(10000, currentUser)).post(`/appointment/create`, {
                customer_email: selectedCustomer.email,
                staff_id: formValue.selectedStaff.doc_id,
                services,
                selectedTimeSlot: formValue.selectedTimeSlot,
                date
            });
            props.fetchAppointments(true);
            handleClose();
        } catch (error) {
            toaster.push(<Notification type={"error"} header={"Failed to create appointment."}/>, {
                placement: 'topEnd'
            });
            console.error(error);

            setFormError(formError);
            setSubmitted(false);
        }
    }

    const renderStaff = () => {
        return setupData.staff.filter((staff) => staff["schedule"] && staff["photoURL"]).map((staff) => {
            return (
                <div key={staff.doc_id} className={styles.staffMasterBody}>
                    <div key={staff.doc_id} className={styles.staffBody}>
                        <div>
                            <img src={staff.photoURL} alt={staff.firstname + " " + staff.lastname}/>
                        </div>
                        <h5>{staff.firstname} {staff.lastname}</h5>
                    </div>
                    <div className={styles.timeSlots}>
                        {(() => {
                            if (!timeSlots) return <Loader content={"Loading..."}/>

                            if (timeSlots[staff.doc_id]) {
                                return timeSlots[staff.doc_id].map((timeSlot) => {
                                    const isSelected = formValue?.selectedStaff?.doc_id === staff?.doc_id && formValue?.selectedTimeSlot === timeSlot;
                                    return <span key={timeSlot}
                                                 className={"rs-btn rs-btn-active" + (isSelected ? " rs-btn-primary" : " rs-btn-subtle")}
                                                 onClick={() => setFormValue({
                                                     selectedStaff: staff,
                                                     selectedTimeSlot: timeSlot
                                                 })}>{TimeHelper.convertTime24to12(TimeHelper.sliderValTo24(timeSlot))}</span>
                                })
                            } else {
                                return <span>No availability.</span>
                            }
                        })()}
                    </div>
                </div>

            )
        })
    }

    const renderServices = () => {
        return setupData.services.map((service) => {
            return (
                <Checkbox key={service.doc_id} onChange={async (value, checked) => {
                    if (checked) {
                        services.push(service.doc_id);
                        setServices(services);
                    } else {
                        setServices((oldServices) => oldServices.filter((s) => s !== service.doc_id));
                    }

                    await fetchTimeSlots()
                }}> {service.name}</Checkbox>
            )
        })
    }

    const CustomInputGroup = ({placeholder, ...props}) => (
        <InputGroup {...props} style={styles}>
            <Input placeholder={placeholder}/>
            <InputGroup.Addon>
                <FontAwesomeIcon icon={faSearch}/>
            </InputGroup.Addon>
        </InputGroup>
    );

    const search = async (searchVal) => {
        setSelectedCustomer(null);
        try {
            setSearchResults(value.filter((customer) => customer.firstName.toLowerCase().includes(searchVal.toLowerCase()) ||
                customer.lastName.toLowerCase().includes(searchVal.toLowerCase())));
        } catch (error) {
            console.error(error);
        }
    }

    const disableConfirm = !formValue['selectedStaff'] || !formValue['selectedTimeSlot'] || !services.length || !selectedCustomer || !date;

    return (
        <ConfirmModal open={open} handleClose={handleClose}
                      title={props.appointment ? "Modify Appointment" : "New Appointment"}
                      confirmText={props.appointment ? "Update" : "Create"} onConfirm={submitForm}
                      disableConfirm={disableConfirm}>
            <Form className={styles.form} formValue={formValue} onChange={formValue => {
                setFormValue(formValue);
                if (Object.keys(formError).length) setFormError({});
            }} disabled={submitted} readOnly={submitted}>
                <div className={styles.section}>
                    <Calendar compact bordered className={styles.calendar} onChange={(date) => {
                        setDate(date);
                        setTimeSlots(null);
                        setFormValue({});
                    }}/>
                    <div className={styles.services}>
                        {!setupData ? <Loader size={"md"}/> : renderServices()}
                    </div>
                </div>
                <div className={styles.customerContainer}>
                    <CustomInputGroup size="md" className={selectedCustomer ? styles.selectedCustomer : ''}
                                      placeholder={selectedCustomer ? selectedCustomer?.firstName + " " + selectedCustomer?.lastName : "Search Customer"}
                                      onChange={async (e) => {
                                          await search(e.target.value);
                                      }}/>
                    <div className={styles.searchResults}
                         style={searchResults.length ? {display: 'flex'} : {display: 'none'}}>
                        {searchResults.map((customer) => {
                            return (
                                <span key={Math.random()} onClick={() => {
                                    setSelectedCustomer(customer);
                                    setSearchResults([]);
                                }}>{customer.firstName} {customer.lastName}</span>
                            )
                        })}
                    </div>
                </div>
                <div className={styles.staffContainer}>
                    {(!setupData) ? <Loader size={"md"} style={{marginTop: "2rem"}}/> : renderStaff()}
                </div>
            </Form>
        </ConfirmModal>
    )

}