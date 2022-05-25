import {FirebaseAdmin} from "../../../utils/firebase/FirebaseAdmin";
import {CloverAPI} from "../../../utils/clover/CloverAPI";

export default async function handler(req, res) {
    try {
        const tokenData = await FirebaseAdmin.auth().verifyIdToken(req.headers["authorization"]);
        const document = await FirebaseAdmin.firestore().collection("clover_inventory").doc(req.query.id).get();

        if (!document.data()) return res.status(400).json({code: 400, message: "Product not found."});

        await FirebaseAdmin.firestore().collection("clover_inventory").doc(req.query.id).update({
            bookable: !document.data().bookable
        })

        return res.json({bookable: !document.data().bookable})
    } catch (error) {
        console.error(error)
        if (error?.code) {
            return res.status(400).json({code: error.code, message: error.message})
        } else {
            console.error(error);
        }
    }

}
