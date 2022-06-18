import {FirebaseAdmin} from "../../../utils/firebase/FirebaseAdmin";

export default async function handler(req, res) {
    try {
        await FirebaseAdmin.auth().verifyIdToken(req.headers["authorization"]);

        await FirebaseAdmin.firestore().collection("appointments").doc(req.query.id).update({
            ...(req.body?.check_in && { check_in: req.body.check_in }),
            ...(req.body?.check_out && { check_out: req.body.check_out })
        })

        return res.json({});
    } catch (error) {
        console.error(error);

        if (error?.code) {
            return res.status(400).json({ code: error.code, message: error.message })
        } else {
            return res.status(500).json({})
        }
    }
}