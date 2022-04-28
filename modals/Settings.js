import {FirebaseAdmin} from "../utils/firebase/FirebaseAdmin";
import {FirebaseClient} from "../utils/firebase/FirebaseClient";

export class Settings {

    constructor() {
        this.values = {};
    }

    static async getInstance(server) {
        const settings = new Settings();
        if (server) {
            settings.values = (await FirebaseAdmin.firestore().collection("settings").doc("main").get()).data();
        } else {
            settings.values = await FirebaseClient.doc("settings", "main");
        }
        return settings;
    }

    get(key) {
        return this.values[key];
    }

}