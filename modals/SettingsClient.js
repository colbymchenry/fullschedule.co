import {FirebaseClient} from "../utils/firebase/FirebaseClient";

export class SettingsClient {

    constructor() {
        this.values = {};
    }

    static async getInstance() {
        const settings = new SettingsClient();
        settings.values = await FirebaseClient.doc("settings", "main");
        return settings;
    }

    get(key) {
        return this.values[key];
    }

}