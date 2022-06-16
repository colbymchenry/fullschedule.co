import {FirebaseAdmin} from "../../../utils/firebase/FirebaseAdmin";
import {GoogleOAuthAPI} from "../../../utils/googleapis/GoogleOAuthAPI";

export default async function handler(req, res) {

    try {
        const tokenData = await FirebaseAdmin.auth().verifyIdToken(req.headers["authorization"]);
        await GoogleOAuthAPI.getTokens(req.body.code);
        return res.json({});
    } catch (error) {
        console.error(error);
    }

}
