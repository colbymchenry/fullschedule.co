import {FirebaseAdmin} from "../utils/firebase/FirebaseAdmin";

export class Settings {

    constructor() {
        this.values = {};
    }

    static async getInstance() {
        const settings = new Settings();
        settings.values = (await FirebaseAdmin.firestore().collection("settings").doc("main").get()).data();
        return settings;
    }

    get(key) {
        return this.values[key];
    }

}