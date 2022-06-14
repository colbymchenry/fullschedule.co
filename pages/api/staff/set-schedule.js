import {FirebaseAdmin} from "../../../utils/firebase/FirebaseAdmin";
import {Staff} from "../../../modals/Staff";

export default async function handler(req, res) {

    try {
        const tokenData = await FirebaseAdmin.auth().verifyIdToken(req.headers["authorization"]);

        const staff = new Staff(await Staff.get(req.query.id));
        await staff.setSchedule(req.body);

        return res.json({});
    } catch (error) {
        console.error(error);
        if (error?.code ) {
            return res.status(400).json({ code: error.code, message: error.message })
        } else {
            return res.status(500).json({})
        }
    }

}
