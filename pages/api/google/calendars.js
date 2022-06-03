import GoogleCalendarAPI from "../../../utils/googleapis/GoogleCalendarAPI";
import {FirebaseAdmin} from "../../../utils/firebase/FirebaseAdmin";

export default async function handler(req, res) {
    try {
        const tokenData = await FirebaseAdmin.auth().verifyIdToken(req.headers["authorization"]);
        const calendarApi = await GoogleCalendarAPI.getInstance();

        if (req.query.create) {
            return res.json(await calendarApi.createCalendar());
        } else {
            return res.json(await calendarApi.getCalendars());
        }
    } catch (error) {
        console.error(error)
        if (error?.code) {
            return res.status(400).json({code: error.code, message: error.message})
        } else {
            return res.status(500).json({})
        }
    }

}
