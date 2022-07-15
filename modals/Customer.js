import {FirebaseAdmin} from "../utils/firebase/FirebaseAdmin";

export class Customer {

    constructor(data) {
        this.data = data;
    }

    static async create(body) {
        const insertResult = await FirebaseAdmin.firestore().collection("customers").add(body);
        return {...body, doc_id: insertResult.id };
    }

    static async get(id) {
        if (id) {
            const doc = await FirebaseAdmin.firestore().collection("customers").doc(id).get();
            return {...doc.data(), doc_id: id};
        } else {
            const docs = await FirebaseAdmin.firestore().collection("customers").get();
            let staff = [];
            docs.forEach((doc) => {
                staff.push({...doc.data(), doc_id: doc.id});
            });
            return staff;
        }
    }

    static async delete(id) {
        return await FirebaseAdmin.firestore().collection("customers").doc(id).delete();
    }

    static async update(id, data){
        await FirebaseAdmin.firestore().collection("customers").doc(id).update(data);
    }
}