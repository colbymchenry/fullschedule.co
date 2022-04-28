import twilio from "twilio";
import {Settings} from "../../modals/Settings";

export class TwilioAdmin {

    static async sendText(phone, message) {
        const settings = await Settings.getInstance(true);
        const client = twilio(settings.get("twilio_sid"), settings.get("twilio_auth_token"));
        return await client.messages.create({ body: message, from: settings.get("twilio_number"), to: phone})
    }

}