import {FirebaseAdmin} from "../../../utils/firebase/FirebaseAdmin";
import {CloverAPI} from "../../../utils/clover/CloverAPI";
import {doc} from "firebase/firestore";

export default async function handler(req, res) {
    try {
        const tokenData = await FirebaseAdmin.auth().verifyIdToken(req.headers["authorization"]);
        const document = await FirebaseAdmin.firestore().collection("clover_inventory").doc(req.query.id).get();

        try {
            document.data();
        } catch (error) {
            return res.status(400).json({code: 400, message: "Product not found."});
        }

        await FirebaseAdmin.firestore().collection("clover_inventory").doc(req.query.id).update({
            duration: parseInt(req.body.duration)
        })

        return res.json({})
    } catch (error) {
        console.error(error)
        if (error?.code) {
            return res.status(400).json({code: error.code, message: error.message})
        } else {
            return res.status(500).json({})
        }
    }

}
