import {Lead} from "../../../modals/Lead";
import GoogleCalendarAPI from "../../../utils/googleapis/GoogleCalendarAPI";
import {Staff} from "../../../modals/Staff";
import {FirebaseAdmin} from "../../../utils/firebase/FirebaseAdmin";
import {TimeHelper} from "../../../utils/TimeHelper";
import {Settings} from "../../../modals/Settings";

export default async function handler(req, res) {
    try {
        const calendarApi = await GoogleCalendarAPI.getInstance();

        const lead = await Lead.get(req.query.id);

        if (!lead) {
            return res.status(400).json({message: "Failed to find Lead data."});
        }

        const settings = await Settings.getInstance();
        const staff = await Staff.get(req.body.selectedStaff.doc_id);
        const services = await Promise.all(lead.services.map(async ({doc_id}) => {
            const service = await FirebaseAdmin.firestore().collection("clover_inventory").doc(doc_id).get();
            return service.data();
        }));

        const location = `${settings.get("address_street_line1")} ${settings.get("address_street_line2")}, ${settings.get("address_city")}, ${settings.get("address_state")} ${settings.get("address_zip")}`;
        const summary = `RegenMD Appointment`;
        const description = `
        Staff: ${staff.firstname} ${staff.lastname}
        Services: ${services.map((service) => service.name).join(", ")}
        `

        const startDate = new Date(lead.date);


        const [hour, minute] = TimeHelper.sliderValTo24(req.body.selectedTimeSlot).split(":");
        startDate.setHours(parseInt(hour), parseInt(minute), 0);

        const endDate = new Date(lead.date);
        endDate.setHours(parseInt(hour) + 1, parseInt(minute), 0);
        // get all events for this day
        const postedEvent = await calendarApi.postEvent(location, summary, description, startDate, endDate);
        const eventId = postedEvent.id;
        console.log(postedEvent);
    } catch (error) {
        console.error(error)
        if (error?.code) {
            return res.status(400).json({code: error.code, message: error.message})
        } else {
            return res.status(500).json({})
        }
    }

}
