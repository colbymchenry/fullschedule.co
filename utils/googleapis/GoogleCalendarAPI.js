import { google } from 'googleapis';
import {Settings} from "../../modals/Settings";

export default class GoogleCalendarAPI {

    constructor() {
        this.jwtClient = new google.auth.JWT(
            process.env.NEXT_GOOGLEAPI_SERVICE_ACCOUNT_EMAIL,
            null,
            process.env.NEXT_ADMIN_GOOGLEAPI_SERVICE_ACCOUNT_PRIVATE_KEY.replace( /\\n/g, '\n'),
            `https://www.googleapis.com/auth/calendar`
        );
        this.auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.NEXT_GOOGLEAPI_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.NEXT_ADMIN_GOOGLEAPI_SERVICE_ACCOUNT_PRIVATE_KEY.replace( /\\n/g, '\n')
            },
            scopes: `https://www.googleapis.com/auth/calendar`,
        })

        this.calendar = google.calendar({version: 'v3', auth: this.jwtClient});
    }

    // timeMin: (new Date()).toISOString(),
    // maxResults: 10,
    // singleEvents: true,
    // orderBy: 'startTime',
    async getEvents(options) {
        const events = await this.calendar.events.list({...options, calendarId: process.env.NEXT_GOOGLE_CALENDAR_ID });
        return events.data.items;
    }

    async postEvent(summary, location, description, startTime, endTime, attendees) {
        const settings = await Settings.getInstance();
        const timeZone = await settings.get("time_zone");
        const client = await this.auth.getClient();
        const res = await this.calendar.events.insert({
            auth: client,
            calendarId: process.env.NEXT_GOOGLE_CALENDAR_ID,
            resource: {
                summary, location, description, attendees: attendees || [],
                start: {
                    dateTime: startTime,
                    timeZone,
                },
                end: {
                    dateTime: endTime,
                    timeZone,
                },
                reminders: {
                    useDefault: false,
                    overrides: [
                        {method: 'email', minutes: 24 * 60},
                        {method: 'popup', minutes: 10},
                    ],
                }
            },
        })
    }


}

