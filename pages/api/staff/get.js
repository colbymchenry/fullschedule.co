import {FirebaseAdmin} from "../../../utils/firebase/FirebaseAdmin";
import {Staff} from "../../../modals/Staff";
import GoogleCalendarAPI from "../../../utils/googleapis/GoogleCalendarAPI";

export default async function handler(req, res) {

    try {
        const calendarApi = new GoogleCalendarAPI();

        await calendarApi.getEvents();

        let time1 = new Date();
        let time2 = new Date();
        time2.setHours(time2.getHours() + 2);

        await calendarApi.postEvent("test event", "30326", "Testing events", time1, time2);
    } catch (error) {
        console.error(error)
    }

    try {
        const staff = await Staff.get();

        await Promise.all(staff.map(async (staff) => {
            if (staff?.uid) {
                const userAccount = await FirebaseAdmin.auth().getUser(staff['uid']);
                staff['avatar'] = userAccount.photoURL;
                staff['email'] = userAccount.email;
            }
        }));

        return res.json(staff);
    } catch (error) {
        if (error?.code) {
            return res.status(400).json({code: error.code, message: error.message})
        } else {
            console.error(error);
        }
    }

}
