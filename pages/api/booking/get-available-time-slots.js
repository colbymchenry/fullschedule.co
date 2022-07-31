import {Staff} from "../../../modals/Staff";
import GoogleCalendarAPI from "../../../utils/googleapis/GoogleCalendarAPI";
import {FirebaseAdmin} from "../../../utils/firebase/FirebaseAdmin";
import {TimeHelper} from "../../../utils/TimeHelper";
import {Lead} from "../../../modals/Lead";
import ArrayHelper from "../../../utils/ArrayHelper";

export default async function handler(req, res) {
    try {

        const lead = await Lead.get(req.query.id);

        if (!lead && !req.body.services) {
            return res.status(400).json({message: "Failed to find Lead data."});
        }

        const calendarApi = await GoogleCalendarAPI.getInstance();

        // create date at start of day for the day selected
        const timeMin = new Date(req.body.date);
        timeMin.setUTCHours(0, 0, 0, 0);
        const timeMax = new Date(req.body.date);
        timeMax.setUTCHours(24, 0, 0, 0);

        // get all events for this day
        const events = await calendarApi.getEvents({
            timeMin, timeMax,
            singleEvents: true,
            orderBy: 'startTime'
        });

        // get all staff accounts
        let allStaff = await FirebaseAdmin.getCollectionArray("staff");
        allStaff = allStaff.filter((staff) => staff?.bookable && staff?.schedule[req.body.day]?.day);

        // get services from DB
        const services = await Promise.all((lead.services || req.body.services).map(async ({doc_id}) => {
            const service = await FirebaseAdmin.firestore().collection("clover_inventory").doc(doc_id).get();
            return service.data();
        }));

        // calculate the cost of time to use these services
        let totalMinutes = 0;
        services.forEach(({duration}) => totalMinutes += parseInt(duration));
        const servicesHours = Math.floor(totalMinutes / 60);
        const servicesMinutes = totalMinutes % 60;

        // make sure to only return staff members that have all services selected available to them
        allStaff = allStaff.filter((staff) => ArrayHelper.containsAll(services, staff.services, "id"));

        // iterate over the staff accounts and add their available time slots
        const timeSlots = {}
        await Promise.all(allStaff.map(async (staff) => {
            // iterate over schedule, add each time slot per 15 minutes
            const staffObj = new Staff(staff);
            timeSlots[staff.doc_id] = staffObj.getAvailableTimeSlots(req.body.day, 15);

            // get all google events attached to this staff member
            const googleEvents = events.filter((event) => {
                if (event?.extendedProperties?.private?.staff) {
                    const eventStaffId = event.extendedProperties.private.staff;
                    return eventStaffId === staff.doc_id;
                }

                return false;
            });

            // iterate over the events and remove time slots already booked
            googleEvents.forEach((event) => {
                const startTime = new Date(event.start.dateTime);
                const endTime = new Date(event.end.dateTime);
                startTime.setHours(startTime.getHours() - servicesHours - (servicesMinutes > 0 ? 1 : 0), startTime.getMinutes() - servicesMinutes, 0);

                timeSlots[staff.doc_id] = timeSlots[staff.doc_id].filter((timeSlot) => {
                    const [hour, minute] = TimeHelper.sliderValTo24(timeSlot).split(":");
                    const slotTime = new Date(event.start.dateTime);
                    slotTime.setHours(parseInt(hour), parseInt(minute), 0);
                    return !(slotTime > startTime && slotTime < endTime);
                })
            });
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
