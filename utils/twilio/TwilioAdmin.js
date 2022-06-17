import twilio from "twilio";
import {Settings} from "../../modals/Settings";

export class TwilioAdmin {

    static async sendText(phone, message) {
        const settings = await Settings.getInstance();
        const client = twilio(settings.get("twilio_sid"), settings.get("twilio_auth_token"));
        return await client.messages.create({ body: message, from: settings.get("twilio_number"), to: phone})
    }

    static async scheduleText(to, body, sendAt) {
        const settings = await Settings.getInstance();
        const client = twilio(settings.get("twilio_sid"), settings.get("twilio_auth_token"));
        return await client.messages.create({
            messagingServiceSid: settings.get("twilio_mg_sid"),
            body,
            sendAt,
            scheduleType: 'fixed',
            to
        })
    }

    static async cancelText(sid) {
        const settings = await Settings.getInstance();
        const client = twilio(settings.get("twilio_sid"), settings.get("twilio_auth_token"));
        return await client.messages(sid).update({status: 'canceled'})
    }

}