import GoogleCalendarAPI from "../../utils/googleapis/GoogleCalendarAPI";
import {FirebaseAdmin} from "../../utils/firebase/FirebaseAdmin";
import {Staff} from "../../modals/Staff";
import {Lead} from "../../modals/Lead";

export default async function handler(req, res) {
    try {
        const calendarApi = await GoogleCalendarAPI.getInstance();

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

        const results = {}

        if (!events.length) {
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

            return res.json(results);
        }

        await Promise.all(events.map(async (event) => {
            if (event?.extendedProperties?.private?.staff) {
                const eventStaffId = event.extendedProperties.private.staff;
                const querySnapshot = await FirebaseAdmin.firestore().collection("appointments").where("google_event_id", "==", event.id).get();
                let result = []
                querySnapshot.forEach((doc) => {
                    result.push({...doc.data(), doc_id: doc.id})
                });

                if (result.length > 0) {

                    if (result[0]["lead"]) {
                        result[0]["lead"] = await Lead.get(result[0]["lead"]);
                    }

                    if (result[0]["services"]) {
                        result[0]["services"] = await Promise.all(result[0]["services"].map(async (service_id) => (await FirebaseAdmin.firestore().collection("clover_inventory").doc(service_id).get()).data()))
                    }

                    if (!results[eventStaffId]) {
                        results[eventStaffId] = {}
                        results[eventStaffId]["appointments"] = [result[0]];
                        if (result[0]["staff"]) {
                            const staffObj = await Staff.get(result[0]["staff"]);
                            results[eventStaffId]["staff"] = staffObj;
                            const userAccount = await FirebaseAdmin.auth().getUser(staffObj.uid);

                            if (userAccount?.photoURL) {
                                results[eventStaffId]["staff"]["photoURL"] = userAccount.photoURL;
                            }
                        }
                    } else {
                        results[eventStaffId]["appointments"].push(result[0]);
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
