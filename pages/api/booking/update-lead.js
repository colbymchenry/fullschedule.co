import {Lead} from "../../../modals/Lead";

export default async function handler(req, res) {
    try {
        await Lead.update(req.query.id, req.body);
        const lead = await Lead.get(req.query.id);
        return res.json({ lead });
    } catch (error) {
        console.error(error)
        if (error?.code) {
            return res.status(400).json({code: error.code, message: error.message})
        } else {
            return res.status(500).json({})
        }
    }

}
