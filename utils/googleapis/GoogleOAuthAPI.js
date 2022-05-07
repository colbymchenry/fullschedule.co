import { google } from 'googleapis';

export class GoogleOAuthAPI {

    static async getTokens(code) {
        const oauth2Client = new google.auth.OAuth2(
            process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            process.env.NEXT_GOOGLE_CLIENT_SECRET,
            'http://localhost:3000/admin/dashboard/settings'
        );

        const { tokens } = await oauth2Client.getToken(code);
        return tokens;
    }

}