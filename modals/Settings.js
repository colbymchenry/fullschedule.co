import {FirebaseAdmin} from "../utils/firebase/FirebaseAdmin";

export class Settings {

    constructor() {
        this.values = {};
        this.booking = false;
    }

    static async getInstance() {
        const settings = new Settings();
        settings.values = (await FirebaseAdmin.firestore().collection("settings").doc("main").get()).data();
        return settings;
    }

    static async getBookingInstance() {
        const settings = new Settings();
        settings.values = (await FirebaseAdmin.firestore().collection("settings").doc("booking").get()).data();
        settings.booking = true;
        return settings;
    }

    get(key) {
        return this.values[key];
    }

    async set(key, value) {
        let obj = {};
        obj[key] = value;
        return await FirebaseAdmin.firestore().collection("settings").doc(this.booking ? "booking" : "main").update(obj);
    }

}