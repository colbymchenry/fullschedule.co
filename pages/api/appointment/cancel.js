import {FirebaseAdmin} from "../../../utils/firebase/FirebaseAdmin";
import GoogleCalendarAPI from "../../../utils/googleapis/GoogleCalendarAPI";
import {Lead} from "../../../modals/Lead";
import {CloverAPI} from "../../../utils/clover/CloverAPI";
import TextMagicHelper from "../../../utils/textmagic/TextMagicHelper";

export default async function handler(req, res) {
    try {
        await FirebaseAdmin.auth().verifyIdToken(req.headers["authorization"]);

        const appointment = (await FirebaseAdmin.firestore().collection("appointments").doc(req.query.id).get()).data();

        await FirebaseAdmin.firestore().collection("appointments").doc(req.query.id).update({
            cancelled: true
        });

        let response = [];

        try {
            const textMagic = await TextMagicHelper.getInstance();
            await textMagic.deleteScheduledMessage(appointment.text_magic_reminder_id);
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

        if (req.body.charge && req.body.cancellationFee) {
            try {
                const lead = await Lead.get(appointment.lead);
                const cloverApi = await CloverAPI.getInstance();
                if (process.env.NEXT_ENV !== "DEV") {
                    await cloverApi.createCharge(lead.clover_source, req.body.cancellationFee * 100, lead.email);
                }
                response.push(`Charged $${req.body.cancellationFee} no show fee and emailed customer a receipt.`);
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