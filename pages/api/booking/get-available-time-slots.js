import {Lead} from "../../../modals/Lead";
import {Staff} from "../../../modals/Staff";
import GoogleCalendarAPI from "../../../utils/googleapis/GoogleCalendarAPI";
import {FirebaseAdmin} from "../../../utils/firebase/FirebaseAdmin";

export default async function handler(req, res) {
    try {
        const calendarApi = await GoogleCalendarAPI.getInstance();

        // get all events for this day
        const events = await calendarApi.getEvents({
            timeMin: req.body.date,
            singleEvents: true,
            orderBy: 'startTime',
        });

        // get all staff accounts
        let allStaff = await FirebaseAdmin.getCollectionArray("staff");
        allStaff = allStaff.filter((staff) => staff?.bookable && staff?.schedule[req.body.day]?.day);

        const timeSlots = {}
        await Promise.all(allStaff.map(async (staff) => {
            // iterate over schedule, add each time slot per 15 minutes
            const staffObj = new Staff(staff);
            timeSlots[staff.doc_id] = staffObj.getAvailableTimeSlots(req.body.day);
        }));


        return res.json(timeSlots);
    } catch (error) {
        console.error(error)
        if (error?.code) {
            return res.status(400).json({code: error.code, message: error.message})
        } else {
            return res.status(500).json({})
        }
    }

}
