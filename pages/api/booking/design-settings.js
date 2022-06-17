import {FirebaseAdmin} from "../../../utils/firebase/FirebaseAdmin";

export default async function handler(req, res) {
    try {
        let booking_settings = await FirebaseAdmin.firestore().collection("settings").doc("booking").get();

        if (booking_settings) {
            booking_settings = booking_settings.data();
        }

        return res.json({booking_settings});
    } catch (error) {
        console.error(error)
        if (error?.code) {
            return res.status(400).json({code: error.code, message: error.message})
        } else {
            return res.status(500).json({})
        }
    }

}
