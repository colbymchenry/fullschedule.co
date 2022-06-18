import GoogleCalendarAPI from "../../utils/googleapis/GoogleCalendarAPI";
import {FirebaseAdmin} from "../../utils/firebase/FirebaseAdmin";
import {Staff} from "../../modals/Staff";
import {Lead} from "../../modals/Lead";
import TextMagicHelper from "../../utils/textmagic/TextMagicHelper";

export default async function handler(req, res) {
    try {
        const calendarApi = await GoogleCalendarAPI.getInstance();

        try {
            await TextMagicHelper.getInstance();
        } catch (error) {
            console.error(error);
        }

        // create date at start of day for the day selected
        const timeMin = new Date(req.body.date);
        timeMin.setUTCHours(0, 0, 0, 0);
        const timeMax = new Date(req.body.date);
        timeMax.setUTCHours(24, 0, 0, 0);

        // get all events for this day
        const events = await calendarApi.getEvents({
            timeMin,
            timeMax,
            singleEvents: true,
            orderBy: 'startTime'
        });

        const results = {};

        let allStaff = await FirebaseAdmin.getCollectionArray("staff");
        allStaff = allStaff.filter((staff) => staff?.bookable);
        await Promise.all(allStaff.map(async (staff) => {
            if (!results[staff.doc_id]) {
                results[staff.doc_id] = {}
                results[staff.doc_id]["appointments"] = [];
                results[staff.doc_id]["staff"] = staff;
                const userAccount = await FirebaseAdmin.auth().getUser(staff.uid);
                if (userAccount?.photoURL) {
                    results[staff.doc_id]["staff"]["photoURL"] = userAccount.photoURL;
                }
            }
        }));

        await Promise.all(events.map(async (event) => {
            if (event?.extendedProperties?.private?.staff) {
                const eventStaffId = event.extendedProperties.private.staff;
                const querySnapshot = await FirebaseAdmin.firestore().collection("appointments").where("google_event_id", "==", event.id).get();
                let result = []
                querySnapshot.forEach((doc) => {
                    result.push({...doc.data(), doc_id: doc.id})
                });

                if (result.length > 0) {
                    // try catch in case data is missing, should prevent front errors but could cause unknown issues to why data isn't showing
                    try {
                        if (result[0]["lead"]) {
                            result[0]["lead"] = await Lead.get(result[0]["lead"]);
                        }

                        if (result[0]["services"]) {
                            result[0]["services"] = await Promise.all(result[0]["services"].map(async (service_id) => (await FirebaseAdmin.firestore().collection("clover_inventory").doc(service_id).get()).data()))
                        }

                        results[eventStaffId]["appointments"].push(result[0]);
                    } catch (error) {

                    }

                }
            }
        }))

        return res.json(results);
    } catch (error) {
        console.error(error)
        if (error?.code) {
            return res.status(400).json({code: error.code, message: error.message})
        } else {
            return res.status(500).json({})
        }
    }

}
