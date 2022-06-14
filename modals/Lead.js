import {FirebaseAdmin} from "../utils/firebase/FirebaseAdmin";

export class Lead {

    constructor(data) {
        this.data = data;
    }

    static async create(body) {
        const insertResult = await FirebaseAdmin.firestore().collection("leads").add(body);
        return {...body, doc_id: insertResult.id };
    }

    static async get(id) {
        if (id) {
            const doc = await FirebaseAdmin.firestore().collection("leads").doc(id).get();
            return {...doc.data(), doc_id: id};
        } else {
            const docs = await FirebaseAdmin.firestore().collection("leads").get();
            let staff = [];
            docs.forEach((doc) => {
                staff.push({...doc.data(), doc_id: doc.id});
            });
            return staff;
        }
    }

    static async delete(id) {
        return await FirebaseAdmin.firestore().collection("leads").doc(id).delete();
    }

    static async update(id, data){
        await FirebaseAdmin.firestore().collection("leads").doc(id).update(data);
    }
}