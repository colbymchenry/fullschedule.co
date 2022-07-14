import {FirebaseAdmin} from "../../../utils/firebase/FirebaseAdmin";
import {CloverAPI} from "../../../utils/clover/CloverAPI";

export default async function handler(req, res) {
    try {
        await FirebaseAdmin.auth().verifyIdToken(req.headers["authorization"]);
        const cloverApi = await CloverAPI.getInstance();

        let metadata = null;

        if(req.body["dob"]) {
            const [dobYear, dobMonth, dobDay] = req.body["dob"].split("-");
            metadata = {
                dobYear,
                dobMonth,
                dobDay
            }
        }

        await cloverApi.updateCustomer(req.query.id, req.body["phoneNumber"] ? req.body["phoneNumber"].replace(/-/, '') : null, req.body["email"], req.body["firstName"], req.body["lastName"], metadata);

        await FirebaseAdmin.firestore().collection("customers").doc(req.query.id).update(req.body)

        return res.json({});
    } catch (error) {
        console.error(error)
        if (error?.code) {
            return res.status(400).json({code: error.code, message: error.message})
        } else {
            return res.status(500).json({})
        }
    }

}
