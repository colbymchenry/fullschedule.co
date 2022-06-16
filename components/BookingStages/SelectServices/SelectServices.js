import styles from './styles.module.css'
import React, {forwardRef, useEffect, useState} from "react";
import {Animation, Button, Checkbox, Form, Notification, toaster} from "rsuite";
import {Field} from "../../inputs/Field";
import axios from "axios";

export default function SelectServices(props) {

    const [formValue, setFormValue] = useState({services: []});
    const [formError, setFormError] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [triggerRender, setTriggerRender] = useState(false);

    useEffect(() => {
        if (props?.formValues?.lead) {
            if (props?.formValues?.lead?.services) formValue["services"] = props?.formValues?.lead?.services;
            setFormValue(formValue);
            setTriggerRender(!triggerRender);
        }
    }, []);

    const submitForm = async () => {
        setSubmitted(true);
        try {
            formValue["services"] = formValue["services"].map((service) => {
                return {
                    doc_id: service.doc_id,
                    name: service.name
                }
            })

            const leadUpdate = await axios.post(`/api/booking/update-lead?id=${props.formValues.lead.doc_id}`, formValue);
            props.appendFormValues(leadUpdate.data)
        } catch (error) {
            toaster.push(<Notification type={"error"}
                                       header={"Error connecting to database. Please email, call, or use our live chat to reach us."}/>, {
                placement: 'topEnd'
            });
        }
        setSubmitted(false);
    }

    const categories = () => {
        const array = [];
        props.setupData.services.forEach((item) => {
            if (item?.categories?.elements) {
                item.categories.elements.forEach((categoryElem) => {
                    if (!(array.filter((cat) => cat.id === categoryElem.id).length)) {
                        array.push({
                            id: categoryElem.id,
                            name: categoryElem.name
                        })
                    }
                })
            }
        })

        return array;
    }

    return (
        <Form formValue={formValue} disabled={props.submitted} readOnly={props.submitted} className={styles.form}>

            {categories().map((category) => {
                return <CategoryCollapse key={category.id} category={category} services={props.setupData.services}
                                         setTriggerRender={setTriggerRender} triggerRender={triggerRender}
                                         setFormValue={setFormValue} formValue={formValue}/>
            })}


            <div>
                <Button appearance="primary" type="submit" onClick={submitForm} loading={submitted} disabled={formValue.services.length < 1}>Next</Button>
            </div>
        </Form>
    )

}

const Panel = forwardRef(({style, ...props}, ref) => (
    <div
        {...props}
        ref={ref}
        style={{
            overflow: 'hidden',
            ...style
        }}
    >
        {props.servicesToDisplay.map((service) => {
            return (
                <Field
                    onChange={(value, checked) => {
                        if (checked) {
                            props.formValue["services"].push(service);
                            props.setFormValue(props.formValue)
                        } else {
                            const newFormValue = props.formValue["services"].filter((serviceObj) => serviceObj.doc_id !== service.doc_id);
                            props.setFormValue({"services": newFormValue})
                        }

                        props.setTriggerRender(!props.triggerRender);
                    }}
                    key={service.doc_id}
                    className={styles.serviceSelection}
                    name={service.doc_id}
                    value={service.doc_id}
                    label={service.name}
                    accepter={Checkbox}
                    checked={props.formValue.services.filter((s) => s.doc_id === service.doc_id).length > 0}
                />
            )
        })}
    </div>
));

Panel.displayName = "Panel";

const CategoryCollapse = ({category, services, formValue, setFormValue, setTriggerRender, triggerRender}) => {

    const [show, setShow] = useState(false);
    const handleToggle = () => setShow(!show);
    const servicesWithinCategory = () => {
        return services.filter((service) => {
            if (service?.categories?.elements) {
                if (service.categories.elements.filter(({id}) => id === category.id).length > 0) {
                    return true;
                }
            }

            return false;
        })
    }

    const servicesToDisplay = servicesWithinCategory();

    return (
        <div className={styles.categoryContainer}>
            <div className={styles.category + (show ? " " + styles.open : "")} onClick={handleToggle}>{category.name}</div>
            <Animation.Collapse in={show}>
                {(props, ref) => <Panel {...props} ref={ref}
                                        servicesToDisplay={servicesToDisplay}
                                        formValue={formValue}
                                        setFormValue={setFormValue}
                                        setTriggerRender={setTriggerRender}
                                        triggerRender={triggerRender}
                />}
            </Animation.Collapse>
        </div>
    )
}