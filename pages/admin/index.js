import {useAuth} from "../../context/AuthContext";
import React, {useEffect, useState} from "react";
import {useRouter} from "next/router";
import {WebflowHelper} from "../../utils/WebflowHelper";
import FormTemplate from "../../components/FormTemplate/FormTemplate";

/*
* Admin login page, only a login form included.
* */
export default function AdminLogin(props) {

    const [formError, setFormError] = useState({});
    const router = useRouter();
    const {login, currentUser} = useAuth();

    const submitForm = async (formData) => {
        try {
            await login(formData['email'], formData['password']);
            await router.push('/admin/dashboard');
        } catch (e) {
            if (e?.code === 'auth/user-not-found') {
                formError['email'] = "User not found.";
            } else if (e?.code === 'auth/wrong-password') {
                formError['password'] = "Wrong password."
            }

            setFormError(formError);
        }
    }

    // If client is logged in go ahead and redirect to the dashboard
    useEffect(() => {
        if (currentUser) {
            (async () => {
                await router.push('/admin/dashboard');
            })();
        }

    }, [currentUser, router]);

    useEffect(() => {
        WebflowHelper.init("62f2af52c96fca64a3ea1d2b")
    });

    function formatAMPM(date) {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        return hours + ':' + minutes + ' ' + ampm;
    }

    const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    return (
        <>
            <div className={"body"}>
                <div className={"w-layout-grid grid"}>
                    <div id="w-node-eafd1bed-7715-82c5-b918-c4b2233f4b32-a3ea1d2b" className={"logincontainer"}>
                        <div className={"logininnercontainer"}>
                            <h1 className={"loginheading"}>Sign in</h1>
                            <div className={"form-block" + " w-form"}>
                                <FormTemplate onSubmit={submitForm} className={"form"}>
                                    <label htmlFor="email" className={"label"}>Email Address *</label>
                                    <input
                                        type="email"
                                        className={"inputfield w-input"}
                                        maxLength="256"
                                        name="email"
                                        data-name="email"
                                        placeholder="me@example.com"
                                        pattern={"^(?=[^\\s@]{1,64}@)[^\\s@]+@[^\\s@]+\\.(.{2}|.{3})+$"}
                                        id="email"/>
                                    <label
                                        htmlFor="password" className={"label"}>Password *</label>
                                    <input type="password"
                                           className={"inputfield w-input"}
                                           maxLength="256"
                                           name="password"
                                           data-name="password"
                                           placeholder="Enter your password"
                                           id="password"
                                           required=""/>
                                    <input
                                    type="submit" value="Sign in" data-wait="Please wait..."
                                    className={"primary-button w-button"}/>
                                </FormTemplate>
                            </div>
                        </div>
                    </div>
                    <div id="w-node-cfd1e077-53d5-b86f-b7f8-e9e3d1388afa-a3ea1d2b"
                         className={"rightcolumn"}></div>
                    <div id="w-node-ee3239b9-ccae-9851-a38e-4073449c53e5-a3ea1d2b"
                         className={"datetimecontainer"}>
                        <h1 data-w-id="c3dfdddc-2651-7291-a70b-b7ab95983a59" style={{color: "rgb(255,202,202)"}}
                            className={"heading"}>{formatAMPM(new Date()).split(" ")[0]}<span
                            className={"text-span"}>{formatAMPM(new Date()).split(" ")[1]}</span><br/>{weekday[new Date().getDay()]}<br/>{new Date().toLocaleString('default', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                        })}</h1>
                    </div>
                    <div id="w-node-c71f5f9e-d463-d6e6-43a3-0095930e3a18-a3ea1d2b"
                         className={"footercontainer"}>
                        <div className={"text-block"}>Full Schedule ® - License for Balanced Aesthetics Medspa
                        </div>
                    </div>
                </div>
            </div>
        </>
    )

}

