import {FirebaseAdmin} from "../../../utils/firebase/FirebaseAdmin";
import {CloverAPI} from "../../../utils/clover/CloverAPI";

export default async function handler(req, res) {
    try {
        const tokenData = await FirebaseAdmin.auth().verifyIdToken(req.headers["authorization"]);
        const cloverApi = await CloverAPI.getInstance();

        req.body["price"] = req.body["price"].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"")
        req.body["price"] = req.body["price"].replace(/\s{2,}/g," ")

        const cloverItem = await cloverApi.createInventoryItem(req.body["name"], req.body["price"]);

        await FirebaseAdmin.firestore().collection("clover_inventory").add({"bookable": false, ...cloverItem.data})

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
