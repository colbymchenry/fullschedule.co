import {FirebaseAdmin} from "../../../utils/firebase/FirebaseAdmin";

export async function getBookableServices() {
    const querySnapshot = await FirebaseAdmin.firestore().collection("clover_inventory").where("bookable", "==", true).get();
    let result = []
    querySnapshot.forEach((doc) => {
        result.push({...doc.data(), doc_id: doc.id})
    });
    return result;
}

export async function getBookableStaff() {
    const querySnapshot = await FirebaseAdmin.firestore().collection("staff").where("bookable", "==", true).get();
    let result = []
    querySnapshot.forEach((doc) => {
        result.push({...doc.data(), doc_id: doc.id})
    });
    return result;
}

export default async function handler(req, res) {
    try {
        const services = await getBookableServices();
        const staff = await getBookableStaff();
        let booking_settings = await FirebaseAdmin.firestore().collection("settings").doc("booking").get();

        if (booking_settings) {
            booking_settings = booking_settings.data();
        }

        return res.json({services, staff, booking_settings });
    } catch (error) {
        console.error(error)
        if (error?.code) {
            return res.status(400).json({code: error.code, message: error.message})
        } else {
            console.error(error);
        }
    }

}
