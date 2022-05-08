import { google } from 'googleapis';
import {Settings} from "../../modals/Settings";

export class GoogleOAuthAPI {

    static async getTokens(code) {
        const oauth2Client = new google.auth.OAuth2(
            process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            process.env.NEXT_GOOGLE_CLIENT_SECRET,
            'postmessage'
        );

        const { tokens } = await oauth2Client.getToken(code);

        const settings = await Settings.getInstance();
        await settings.set("google_tokens", tokens);
        return tokens;
    }

}