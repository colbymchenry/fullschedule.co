import {FirebaseAdmin} from "../../utils/firebase/FirebaseAdmin";

export default async function handler(req, res) {

    try {
        const booking = await FirebaseAdmin.firestore().collection("appointments").doc(req.query.id).get();
        const bookingData = await booking.data();
        const lead = await FirebaseAdmin.firestore().collection("leads").doc(bookingData.lead).get();
        const leadData = await lead.data();
        return res.json({ bookingData, leadData});
    } catch (error) {
        console.error(error);
        return res.json({ bookingData: null, leadData: null });
    }

}
