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

        const cloverApi = await CloverAPI.getInstance();
        await cloverApi.updateInventoryItem(document.data().id, {
            price: ("" + req.body.price).replace(".", "")
        })

        await FirebaseAdmin.firestore().collection("clover_inventory").doc(req.query.id).update({
            price: parseInt(("" + req.body.price).replace(".", ""))
        })

        return res.json({})
    } catch (error) {
        console.error(error)
        if (error?.code) {
            return res.status(400).json({code: error.code, message: error.message})
        } else {
            console.error(error);
        }
    }

}
