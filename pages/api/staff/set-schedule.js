import {FirebaseAdmin} from "../../../utils/firebase/FirebaseAdmin";
import {Staff} from "../../../modals/Staff";

export default async function handler(req, res) {

    try {
        const tokenData = await FirebaseAdmin.auth().verifyIdToken(req.headers["authorization"]);

        const staff = new Staff(await Staff.get(req.body.id));

        await staff.setSchedule(req.body.schedule);

        return res.json({});
    } catch (error) {
        if (error?.code ) {
            return res.status(400).json({ code: error.code, message: error.message })
        } else {
            console.error(error);
        }
    }

}
