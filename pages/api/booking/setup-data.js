import {FirebaseAdmin} from "../../../utils/firebase/FirebaseAdmin";

export async function getBookableServices() {
    const querySnapshot = await FirebaseAdmin.firestore().collection("clover_inventory").where("bookable", "==", true).get();
    let result = []
    querySnapshot.forEach((doc) => {
        let data = doc.data();
        delete data["modifiedTime"]
        delete data["isRevenue"]
        delete data["defaultTaxRates"];
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
        let services = await getBookableServices();
        const staff = await getBookableStaff();
        let booking_settings = await FirebaseAdmin.firestore().collection("settings").doc("booking").get();
        let main_settings = await FirebaseAdmin.firestore().collection("settings").doc("main").get();

        if (booking_settings) {
            booking_settings = booking_settings.data();
        }

        if (main_settings) {
            main_settings = main_settings.data();
        }

        // restrict selectable services to ones that are available to bookable staff members
        if (staff) {
            let allServices = [];
            staff.forEach((s) => {
                if (s?.services) {
                    allServices = [...allServices, ...s.services]
                }
            });

            services = services.filter((s) => allServices.includes(s.id));
        }

        return res.json({services, staff, booking_settings,
            ...(main_settings?.phone && { phone: main_settings.phone }),
            ...(main_settings?.address_city && { address_city: main_settings.address_city }),
            ...(main_settings?.address_street_line1 && { address_street_line1: main_settings.address_street_line1 }),
            ...(main_settings?.address_street_line2 && { address_street_line2: main_settings.address_street_line2 }),
            ...(main_settings?.address_zip && { address_zip: main_settings.address_zip }),
            ...(main_settings?.address_state && { address_state: main_settings.address_state }),
            ...(main_settings?.office_manager_email && { office_manager_email: main_settings.office_manager_email }),
            ...(main_settings?.pixel_id && { pixel_id: main_settings.pixel_id }),
            ...(main_settings?.time_zone && { time_zone: main_settings.time_zone }),
            ...(main_settings?.company_name && { company_name: main_settings.company_name }),
            ...(main_settings?.socials_facebook && { socials_facebook: main_settings.socials_facebook }),
            ...(main_settings?.socials_instagram && { socials_instagram: main_settings.socials_instagram }),
            ...(main_settings?.socials_tiktok && { socials_tiktok: main_settings.socials_tiktok }),
            ...(main_settings?.socials_twitter && { socials_twitter: main_settings.socials_twitter }),
            ...(main_settings?.socials_youtube && { socials_youtube: main_settings.socials_youtube })
        });
    } catch (error) {
        console.error(error)
        if (error?.code) {
            return res.status(400).json({code: error.code, message: error.message})
        } else {
            return res.status(500).json({})
        }
    }

}
