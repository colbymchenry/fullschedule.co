import {FirebaseAdmin} from "../../../utils/firebase/FirebaseAdmin";
import {TwilioAdmin} from "../../../utils/twilio/TwilioAdmin";
import GoogleCalendarAPI from "../../../utils/googleapis/GoogleCalendarAPI";
import {Lead} from "../../../modals/Lead";
import {CloverAPI} from "../../../utils/clover/CloverAPI";

export default async function handler(req, res) {
    try {
        await FirebaseAdmin.auth().verifyIdToken(req.headers["authorization"]);

        const appointment = (await FirebaseAdmin.firestore().collection("appointments").doc(req.query.id).get()).data();

        await FirebaseAdmin.firestore().collection("appointments").doc(req.query.id).update({
            cancelled: true
        });

        let response = [];

        try {
            await TwilioAdmin.cancelText(appointment.twilioReminderSID);
            response.push("Cancelled text reminder.");
        } catch (err) {
            response.push("Failed to cancel text reminder.");
        }

        try {
            const calendarApi = await GoogleCalendarAPI.getInstance();
            await calendarApi.deleteEvent(appointment.google_event_id);
            response.push("Cancelled Google calendar event and notified customer.");
        } catch (err) {
            response.push("Failed to cancel Google event.");
        }

        if (req.body.charge) {
            try {
                const lead = await Lead.get(appointment.lead);
                const cloverApi = await CloverAPI.getInstance();
                if (process.env.NEXT_ENV !== "DEV") {
                    await cloverApi.createCharge(lead.clover_source, 5 * 100, lead.email);
                }
                response.push("Charged $75 no show fee and emailed customer a receipt.");
            } catch (err) {
                console.error(err.raw)
                response.push("Failed to charge no show fee.");
            }
        }

        response.push(" ");
        response.push("Appointment cancelled.");

        return res.json({ response });
    } catch (error) {
        console.error(error);

        if (error?.code) {
            return res.status(400).json({ code: error.code, message: error.message })
        } else {
            return res.status(500).json({})
        }
    }
}