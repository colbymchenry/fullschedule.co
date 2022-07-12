import {FirebaseAdmin} from "../../../utils/firebase/FirebaseAdmin";
import {CloverAPI} from "../../../utils/clover/CloverAPI";

export default async function handler(req, res) {
    try {
        const tokenData = await FirebaseAdmin.auth().verifyIdToken(req.headers["authorization"]);
        const cloverApi = await CloverAPI.getInstance();

        req.body['phoneNumber'] = req.body["phoneNumber"].replace(/-/g, '');

        const emailQuery = await FirebaseAdmin.firestore().collection("customers").where("email", "==", req.body.email.toLowerCase()).get();
        const phoneQuery = await FirebaseAdmin.firestore().collection("customers").where("phoneNumber", "==", req.body.phoneNumber).get();

        const errors = {};

        // check for a customer with this email to make sure they do not exist
        if (emailQuery.size) {
            errors["email"] = 'Customer with that email already exists.';
        }

        // check for a customer with this phone number to make sure they do not exist
        if (phoneQuery.size) {
            errors["phoneNumber"] = 'Customer with that phone number already exists.';
        }

        if (Object.keys(errors).length) {
            return res.status(400).json(errors);
        }

        const [dobYear, dobMonth, dobDay] = req.body["dob"].split("T")[0].split("-");
        const metadata = {
            dobYear,
            dobMonth,
            dobDay
        }

        const cloverCustomer = await cloverApi.createCustomer(req.body["phoneNumber"], req.body["email"], req.body["firstName"], req.body["lastName"], metadata);

        await FirebaseAdmin.firestore().collection("customers").doc(cloverCustomer.data.id).set({
            firstName: req.body['firstName'],
            lastName: req.body['lastName'],
            email: req.body['email'].toLowerCase(),
            phoneNumber: req.body['phoneNumber'],
            dob: req.body["dob"].split("T")[0]
        })

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
