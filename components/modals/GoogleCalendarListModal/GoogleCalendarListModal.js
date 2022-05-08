import ConfirmModal from "../ConfirmModal/ConfirmModal";
import {Loader, Notification, SelectPicker, toaster} from "rsuite";
import React, {useEffect, useState} from "react";
import {APIConnector} from "../../APIConnector";
import {FirebaseClient} from "../../../utils/firebase/FirebaseClient";

export default function GoogleCalendarListModal(props) {

    const [calendars, setCalendars] = useState(null);
    const [selectedCalendar, setSelectedCalendar] = useState(null);
    const [creatingCalendar, setCreatingCalendar] = useState(false);
    const [createdCalendar, setCreatedCalendar] = useState(false);

    const createCalendar = async () => {
        setCreatingCalendar(true);

        try {
            const res = await (await APIConnector.create(2000, props.currentUser)).get(`/google/calendars?create=true`);
            calendars.push({ label: res.data.summary, value: res.data.id });
            setCalendars(calendars);
            setSelectedCalendar(res.data.id);
            setCreatedCalendar(true);
        } catch (error) {
            toaster.push(<Notification type={"error"} header={"Failed to get calendars from Google."}/>, {
                placement: 'topEnd'
            });
        }

        setCreatingCalendar(false);
    }

    useEffect(() => {
        (async () => {
            try {
                const res = await (await APIConnector.create(2000, props.currentUser)).get(`/google/calendars`);
                setCalendars(res.data.map(({summary, id}) => {
                    return {
                        label: summary,
                        value: id
                    }
                }))
            } catch (error) {
                toaster.push(<Notification type={"error"} header={"Failed to get calendars from Google."}/>, {
                    placement: 'topEnd'
                });
            }

        })();
    }, []);

    return (
        <ConfirmModal title={"Full Schedule - Google Calendar Selection"} disableConfirm={!selectedCalendar} onConfirm={async () => {
            try {
                if (!await FirebaseClient.doc("settings", "main")) {
                    await FirebaseClient.set("settings", "main", {
                        google_calendar_id: selectedCalendar
                    });
                } else {
                    await FirebaseClient.update("settings", "main", {
                        google_calendar_id: selectedCalendar
                    });
                }

                toaster.push(<Notification type={"success"} header={"Settings saved!"}/>, {
                    placement: 'topEnd'
                });
            } catch (error) {
                console.error(error);
                toaster.push(<Notification type={"error"} header={"Failed to delete text messages."}/>, {
                    placement: 'topEnd'
                });
            }
        }}>

            {(!calendars || creatingCalendar) ? <div className={`d-flex align-items-center`} style={{ gap: '1rem' }}>{creatingCalendar ? "Creating calendar..." : "Fetching calendars..."} <Loader /></div> : (
                <div className={`d-flex flex-column`}>
                    {!createdCalendar &&
                        <>
                        <p style={{width: "420px"}}>If there is no suitable calendar, you can create one by clicking <a
                            href={"#"} onClick={createCalendar}>here</a>.</p>
                        <small style={{marginLeft: '0.5rem'}}><i>- Do NOT choose a personal calendar.</i></small>
                        <br />
                        </>
                    }
                    <SelectPicker data={calendars} searchable={false} style={{ width: "420px" }} placeholder={"Select Calendar"} value={selectedCalendar} onSelect={(value, item, event) => setSelectedCalendar(value)} />
                </div>
            )}
        </ConfirmModal>
    )

}