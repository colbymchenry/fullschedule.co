import {CloverAPI} from "../../../utils/clover/CloverAPI";
import {Lead} from "../../../modals/Lead";

export default async function handler(req, res) {

    const { source } = req.body

    try {
        const lead = await Lead.get(req.query.id);
        const cloverApi = await CloverAPI.getInstance();
        const resp = await cloverApi.createCharge(source, 1, lead?.email);
        return res.json({ id: resp.id })
    } catch (e) {
        return res.status(500).json({message: e.message})
    }
}
