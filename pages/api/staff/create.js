import {FirebaseAdmin} from "../../../utils/firebase/FirebaseAdmin";
import {Staff} from "../../../modals/Staff";

export default async function handler(req, res) {

    try {
        const tokenData = await FirebaseAdmin.auth().verifyIdToken(req.headers["authorization"]);

        const staff = await Staff.create(req.body.email, req.body.password, req.body.firstname, req.body.lastname, req.body.avatar, req.body.services);

        return res.json(staff);
    } catch (error) {
        if (error?.code ) {
            return res.status(400).json({ code: error.code, message: error.message })
        } else {
            console.error(error);
        }
    }

}
