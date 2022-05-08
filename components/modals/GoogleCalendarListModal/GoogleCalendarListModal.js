import ConfirmModal from "../ConfirmModal/ConfirmModal";
import {Loader, Notification, SelectPicker, toaster} from "rsuite";
import React, {useEffect, useState} from "react";
import {APIConnector} from "../../APIConnector";
import {FirebaseClient} from "../../../utils/firebase/FirebaseClient";

export default function GoogleCalendarListModal(props) {

    const [calendars, setCalendars] = useState(null);
    const [selectedCalendar, setSelectedCalendar] = useState(null);

    useEffect(() => {
        (async () => {
            const res = await (await APIConnector.create(2000, props.currentUser)).get(`/google/calendars`);
            setCalendars(res.data.map(({summary, id}) => {
                return {
                    label: summary,
                    value: id
                }
            }))
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

            {!calendars ? <div className={`d-flex align-items-center`} style={{ gap: '1rem' }}>Fetching calendars... <Loader /></div> : <SelectPicker data={calendars} searchable={false} style={{ width: "50%"}} placeholder={"Select Calendar"} onSelect={(value, item, event) => setSelectedCalendar(value)} />}
        </ConfirmModal>
    )

}