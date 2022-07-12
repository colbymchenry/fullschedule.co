import {FirebaseAdmin} from "../../../utils/firebase/FirebaseAdmin";
import {CloverAPI} from "../../../utils/clover/CloverAPI";

export default async function handler(req, res) {
    try {
        await FirebaseAdmin.auth().verifyIdToken(req.headers["authorization"]);
        const cloverApi = await CloverAPI.getInstance();
        // const customers = await cloverApi.getCustomers((await FirebaseAdmin.getCollectionArray("customers")).length === 0);
        const customers = await cloverApi.getCustomers(false);
        return res.json(customers);
    } catch (error) {
        console.error(error)
        if (error?.code) {
            return res.status(400).json({code: error.code, message: error.message})
        } else {
            return res.status(500).json({})
        }
    }

}
