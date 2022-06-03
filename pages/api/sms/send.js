import {TwilioAdmin} from "../../../utils/twilio/TwilioAdmin";
import {FirebaseAdmin} from "../../../utils/firebase/FirebaseAdmin";

export default async function handler(req, res) {

    try {
        const tokenData = await FirebaseAdmin.auth().verifyIdToken(req.headers["authorization"]);

        const twilioRes = await TwilioAdmin.sendText(req.body.phone, req.body.message);

        await FirebaseAdmin.firestore().collection("sms_messages").add({
            sender: tokenData.uid,
            receiver: req.body.phone,
            message: req.body.message,
            sent_at: FirebaseAdmin.serverTimestamp(),
            opened: true,
            delivered: false,
            messageId: twilioRes.sid
        });

        return res.json({});
    } catch (error) {
        console.error(error);
        return res.status(500).json({})
    }

}
