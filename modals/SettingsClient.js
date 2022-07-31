import {FirebaseClient} from "../utils/firebase/FirebaseClient";
import {FirebaseAdmin} from "../utils/firebase/FirebaseAdmin";

export class SettingsClient {

    constructor() {
        this.values = {};
        this.booking = false;
    }

    static async getInstance() {
        const settings = new SettingsClient();
        settings.values = await FirebaseClient.doc("settings", "main");
        return settings;
    }

    static async getBookingInstance() {
        const settings = new SettingsClient();
        settings.values = await FirebaseClient.doc("settings", "booking");
        settings.booking = true;
        return settings;
    }

    get(key) {
        return this.values[key];
    }

    async set(key, value) {
        let obj = {};
        obj[key] = value;
        return await FirebaseClient.update("settings", this.booking ? "booking" : "main", obj);
    }

}