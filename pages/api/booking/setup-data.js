import {FirebaseAdmin} from "../../../utils/firebase/FirebaseAdmin";

export async function getBookableServices() {
    const querySnapshot = await FirebaseAdmin.firestore().collection("clover_inventory").where("bookable", "==", true).get();
    let result = []
    querySnapshot.forEach((doc) => {
        let data = doc.data();
        delete data["modifiedTime"]
        delete data["isRevenue"]
        delete data["defaultTaxRates"];
        delete data["id"];
        result.push({...data, doc_id: doc.id})
    });
    return result;
}

export async function getBookableStaff() {
    const querySnapshot = await FirebaseAdmin.firestore().collection("staff").where("bookable", "==", true).get();
    let result = []

    querySnapshot.forEach((doc) => {
        result.push({...doc.data(), doc_id: doc.id})
    });

    await Promise.all(result.map(async (doc) => {
        const uid = doc.uid;
        const userAccount = await FirebaseAdmin.auth().getUser(uid);

        if (userAccount?.photoURL) {
            doc["photoURL"] = userAccount.photoURL;
        }

        delete doc["uid"];
    }));

    return result;
}

export default async function handler(req, res) {
    try {
        const services = await getBookableServices();
        const staff = await getBookableStaff();
        let booking_settings = await FirebaseAdmin.firestore().collection("settings").doc("booking").get();
        let main_settings = await FirebaseAdmin.firestore().collection("settings").doc("main").get();

        if (booking_settings) {
            booking_settings = booking_settings.data();
        }

        if (main_settings) {
            main_settings = main_settings.data();
        }

        return res.json({services, staff, booking_settings, ...(main_settings?.phone && { phone: main_settings.phone }) });
    } catch (error) {
        console.error(error)
        if (error?.code) {
            return res.status(400).json({code: error.code, message: error.message})
        } else {
            return res.status(500).json({})
        }
    }

}
