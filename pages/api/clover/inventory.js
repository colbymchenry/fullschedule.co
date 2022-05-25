import {FirebaseAdmin} from "../../../utils/firebase/FirebaseAdmin";
import {CloverAPI} from "../../../utils/clover/CloverAPI";

export default async function handler(req, res) {
    try {
        const tokenData = await FirebaseAdmin.auth().verifyIdToken(req.headers["authorization"]);
        const cloverApi = await CloverAPI.getInstance();
        if ((await FirebaseAdmin.getCollectionArray("clover_inventory")).length < 2) {
            return res.json(await cloverApi.getInventory(true))
        } else {
            return res.json(await cloverApi.getInventory(false))
        }
    } catch (error) {
        console.error(error)
        if (error?.code) {
            return res.status(400).json({code: error.code, message: error.message})
        } else {
            console.error(error);
        }
    }

}
