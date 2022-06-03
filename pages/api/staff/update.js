import {FirebaseAdmin} from "../../../utils/firebase/FirebaseAdmin";

export default async function handler(req, res) {

    try {
        const tokenData = await FirebaseAdmin.auth().verifyIdToken(req.headers["authorization"]);

        await FirebaseAdmin.auth().updateUser(req.body.uid, {
            displayName: req.body.firstname + " " + req.body.lastname,
            email: req.body.email.toLowerCase()
        });

        await FirebaseAdmin.firestore().collection("staff").doc(req.body.id).update({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            bookable: req.body.bookable
        })

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
