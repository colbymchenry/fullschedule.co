import {FirebaseAdmin} from "../utils/firebase/FirebaseAdmin";

export class Staff {

    constructor(data) {
        this.data = data;
    }

    async setSchedule(schedule) {
        await FirebaseAdmin.firestore().collection("staff").doc(this.data.doc_id).update({
           schedule
        });
    }

    static async create(email, password, firstname, lastname, avatar, services) {
        const user = await FirebaseAdmin.auth().createUser({
            email: email.toLowerCase(),
            emailVerified: true,
            password,
            displayName: firstname + " " + lastname,
            ...(avatar && {photoURL: avatar}),
            disabled: false,
        });

        const staff = await FirebaseAdmin.firestore().collection("staff").add({
            firstname,
            lastname,
            ...(services && {services}),
            uid: user.uid
        });

        return (await FirebaseAdmin.firestore().collection("staff").doc(staff.id).get()).data();
    }

    static async get(id) {
        if (id) {
            const doc = await FirebaseAdmin.firestore().collection("staff").doc(id).get();
            return doc.data();
        } else {
            const docs = await FirebaseAdmin.firestore().collection("staff").get();
            let staff = [];
            docs.forEach((doc) => {
                staff.push({...doc.data(), doc_id: doc.id});
            });
            return staff;
        }
    }

    static async delete(id) {
        return await FirebaseAdmin.firestore().collection("staff").doc(id).delete();
    }

}