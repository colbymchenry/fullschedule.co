import {FirebaseAdmin} from "../../../utils/firebase/FirebaseAdmin";
import {TwilioAdmin} from "../../../utils/twilio/TwilioAdmin";
import GoogleCalendarAPI from "../../../utils/googleapis/GoogleCalendarAPI";

export default async function handler(req, res) {
    try {
        await FirebaseAdmin.auth().verifyIdToken(req.headers["authorization"]);

        const appointment = (await FirebaseAdmin.firestore().collection("appointments").doc(req.query.id).get()).data();

        await FirebaseAdmin.firestore().collection("appointments").doc(req.query.id).update({
            cancelled: true
        });

        try {
            await TwilioAdmin.cancelText(appointment.twilioReminderSID);
            console.log("CANCELLED TEXT");
        } catch (err) {

        }

        try {
            const calendarApi = await GoogleCalendarAPI.getInstance();
            await calendarApi.deleteEvent(appointment.google_event_id);
            console.log("DELETED CALENDAR EVENT")
        } catch (err) {

        }

        return res.json({});
    } catch (error) {
        console.error(error);

        if (error?.code) {
            return res.status(400).json({ code: error.code, message: error.message })
        } else {
            return res.status(500).json({})
        }
    }
}