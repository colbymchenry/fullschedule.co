import {Lead} from "../../../modals/Lead";
import GoogleCalendarAPI from "../../../utils/googleapis/GoogleCalendarAPI";
import {Staff} from "../../../modals/Staff";
import {FirebaseAdmin} from "../../../utils/firebase/FirebaseAdmin";
import {TimeHelper} from "../../../utils/TimeHelper";
import {Settings} from "../../../modals/Settings";

export default async function handler(req, res) {
    try {

        const lead = await Lead.get(req.query.id);

        if (!lead) {
            return res.status(400).json({message: "Failed to find Lead data."});
        }

        // getting settings for Google Calendar event creation
        const settings = await Settings.getInstance();
        // grab staff account from DB
        const staff = await Staff.get(req.body.selectedStaff.doc_id);

        // get services from DB
        const services = await Promise.all(lead.services.map(async ({doc_id}) => {
            const service = await FirebaseAdmin.firestore().collection("clover_inventory").doc(doc_id).get();
            return service.data();
        }));

        // get the start date as the selected time slot and date
        const startDate = new Date(lead.date);
        const [hour, minute] = TimeHelper.sliderValTo24(req.body.selectedTimeSlot).split(":");
        startDate.setHours(parseInt(hour), parseInt(minute), 0);

        // add up service durations to get accurate endTime
        const endDate = new Date(lead.date);
        let totalMinutes = 0;
        services.forEach(({duration}) => totalMinutes += parseInt(duration));
        const addedHours = Math.floor(totalMinutes / 60);
        const addedMinutes = totalMinutes % 60;
        endDate.setHours(parseInt(hour) + addedHours, parseInt(minute) + addedMinutes, 0);

        // setup Google Calendar's event variables
        const location = `${settings.get("address_street_line1")} ${settings.get("address_street_line2")}, ${settings.get("address_city")}, ${settings.get("address_state")} ${settings.get("address_zip")}`;
        const summary = `RegenMD Appointment`;
        const description = `
        Provider: ${staff.firstname} ${staff.lastname}
        Services: ${services.map((service) => service.name).join(", ")}
        `;

        // Get a new Google Calendar API instance
        const calendarApi = await GoogleCalendarAPI.getInstance();

        // post new event to Google Calendar
        const postedEvent = await calendarApi.postEvent(location, summary, description, startDate, endDate, null, {
            staff: staff.doc_id
        });

        // Add appointment to DB
        await FirebaseAdmin.firestore().collection("appointments").add({
            lead,
            staff: staff.doc_id,
            google_event_id: postedEvent.id,
            google_event_link: postedEvent.htmlLink,
            start: postedEvent.start,
            end: postedEvent.end
        });

        return res.json({})
    } catch (error) {
        console.error(error)
        if (error?.code) {
            return res.status(400).json({code: error.code, message: error.message})
        } else {
            return res.status(500).json({})
        }
    }

}
