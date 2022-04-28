import {FirebaseAdmin} from "../../../utils/firebase/FirebaseAdmin";
import {Staff} from "../../../modals/Staff";

export default async function handler(req, res) {

    try {
        const staff = await Staff.get();

        await Promise.all(staff.map(async (staff) => {
            if (staff?.uid) {
                const userAccount = await FirebaseAdmin.auth().getUser(staff['uid']);
                staff['avatar'] = userAccount.photoURL;
                staff['email'] = userAccount.email;
            }
        }));

        return res.json(staff);
    } catch (error) {
        if (error?.code ) {
            return res.status(400).json({ code: error.code, message: error.message })
        } else {
            console.error(error);
        }
    }

}
