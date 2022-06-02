import React, {useEffect, useRef, useState} from "react";
import styles from "./styles.module.css";
import {Field} from "../../../../../components/inputs/Field";
import {MaskedInput} from "../../../../../components/inputs/MaskedInput";
import {Button, Form, Notification, toaster, Toggle} from "rsuite";
import {FeatureField, Header} from "../index";
import {FirebaseClient} from "../../../../../utils/firebase/FirebaseClient";
import {SketchPicker, TwitterPicker} from "react-color";
import {Compact} from "react-color/lib/components/compact/Compact";
import CompactColor from "react-color/lib/components/compact/CompactColor";
import {useOutsideAlerter} from "../../../../../components/OutsideAlerter";

export default function DashboardPromotions(props) {

    const [formValue, setFormValue] = useState({});
    const [formError, setFormError] = useState({});
    const [triggerRender, setTriggerRender] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const submitForm = async () => {
        setSubmitted(true);

        try {
            if (!await FirebaseClient.doc("settings", "booking")) {
                await FirebaseClient.set("settings", "booking", formValue);
            } else {
                await FirebaseClient.update("settings", "booking", formValue);
            }

            toaster.push(<Notification type={"success"} header={"Settings saved!"}/>, {
                placement: 'topEnd'
            });
        } catch (error) {
            console.error(error);
            toaster.push(<Notification type={"error"} header={"Failed to save settings."}/>, {
                placement: 'topEnd'
            });
        }

        setSubmitted(false);
    }

    const handleColorChange = (key, color) => {
        if (!formValue["color"]) formValue["color"] = {};
        formValue["color"][key] = color.hex;
        setFormValue(formValue);
        setTriggerRender(!triggerRender);
    }

    useEffect(() => {
        if (!Object.keys(formValue).length) {
            (async () => {
                try {
                    setFormValue(await FirebaseClient.doc("settings", "booking") || {});
                } catch (error) {
                    console.error(error);
                    toaster.push(<Notification type={"error"} header={"Failed to fetch booking settings."}/>, {
                        placement: 'topEnd'
                    });
                }
            })();
        }
    }, [])

    return (
        <div className={styles.container}>
            <Form formValue={formValue} onChange={formValue => {
                setFormValue(formValue);
                if (Object.keys(formError).length) setFormError({});
            }} disabled={submitted} readOnly={submitted}>

                <Header title={"Colors"} label={"Configure your booking colors for a more branded experience."}/>
                <div className={`d-flex flex-column w-100`} style={{gap: '1rem'}}>

                    <FeatureField title={"Background Color"}
                                  hint={"This will only affect the body of the page."}>
                        <CustomColorPicker
                            color={ formValue?.color?.background }
                            onChangeComplete={ (color) => handleColorChange("background", color) }
                        />
                    </FeatureField>

                    <FeatureField title={"Foreground Color"}
                                  hint={"This will affect the wording on a page."}>
                        <CustomColorPicker
                            color={ formValue?.color?.foreground }
                            onChangeComplete={ (color) => handleColorChange("foreground", color) }
                        />
                    </FeatureField>

                    <FeatureField title={"Input Background Color"}
                                  hint={"This will affect the background of inputs such as name, email, phone number."}>
                        <CustomColorPicker
                            color={ formValue?.color?.input_background }
                            onChangeComplete={ (color) => handleColorChange("input_background", color) }
                        />
                    </FeatureField>

                    <FeatureField title={"Input Text Color"}
                                  hint={"This will affect the text color of inputs such as name, email, phone number."}>
                        <CustomColorPicker
                            color={ formValue?.color?.input_color }
                            onChangeComplete={ (color) => handleColorChange("input_color", color) }
                        />
                    </FeatureField>

                    <FeatureField title={"Button Background Color"}
                                  hint={"This will affect the background color of buttons such as the Next button."}>
                        <CustomColorPicker
                            color={ formValue?.color?.button_background }
                            onChangeComplete={ (color) => handleColorChange("button_background", color) }
                        />
                    </FeatureField>

                    <FeatureField title={"Button Text Color"}
                                  hint={"This will affect the text color of buttons such as the Next button."}>
                        <CustomColorPicker
                            color={ formValue?.color?.button_color }
                            onChangeComplete={ (color) => handleColorChange("button_color", color) }
                        />
                    </FeatureField>

                    <FeatureField title={"Custom Google Font"}
                                  hint={[<a href={"https://fonts.google.com/"} target={"_blank"}>Google Font Library</a>, " Copy your favorite font name and paste it here."]}>
                        <Field
                            name="font"
                            type={"text"}
                            accepter={MaskedInput}
                            error={formError["font"]}
                        />
                    </FeatureField>

                </div>

                <br/>
                <br/>
            </Form>
            <Button appearance="primary" onClick={submitForm} loading={submitted}
                    className={'save-button'}>Save</Button>
        </div>
    )

}

export const CustomColorPicker = (props) => {

    const [open, setOpen] = useState(false);
    const [color, setColor] = useState(props?.color || "#FFF");
    const wrapperRef = useRef(null);
    useOutsideAlerter(wrapperRef, () => setOpen(false));

    return (
        <div className={styles.colorPicker} ref={wrapperRef}>
            <CompactColor color={color.hex} onClick={() => setOpen(true)} />
            {open && <SketchPicker
                color={ color.hex }
                onChange={(c) => setColor(c)}
                onChangeComplete={ props.onChangeComplete }
                />}
        </div>
    )

}