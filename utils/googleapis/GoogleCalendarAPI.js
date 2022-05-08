import { google } from 'googleapis';
import {Settings} from "../../modals/Settings";

export default class GoogleCalendarAPI {

    constructor() {
        this.oauth2Client = new google.auth.OAuth2(
            process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            process.env.NEXT_GOOGLE_CLIENT_SECRET,
            'postmessage'
        );
        this.settings = null;
        this.calendar = null;
        this.calendarId = null;
    }

    static async getInstance() {
        const calendarApi = new GoogleCalendarAPI();
        const settings = await Settings.getInstance();
        const tokens = await settings.get("google_tokens");
        await calendarApi.oauth2Client.setCredentials(tokens);
        calendarApi.calendar = google.calendar({version: 'v3', auth: calendarApi.oauth2Client});
        calendarApi.calendarId = settings.google_calendar_id;
        calendarApi.settings = settings;
        return calendarApi;
    }

    // timeMin: (new Date()).toISOString(),
    // maxResults: 10,
    // singleEvents: true,
    // orderBy: 'startTime',
    async getEvents(options) {
        const events = await this.calendar.events.list({...options, calendarId: this.calendarId });
        return events.data.items;
    }

    async getCalendars() {
        return (await this.calendar.calendarList.list()).data.items;
    }

    async createCalendar(name) {
        const timeZone = await this.settings.get("time_zone");
        return (await this.calendar.calendars.insert({
            requestBody: {
                summary: name || "Full Schedule - MASTER",
                ...(timeZone && { timeZone })
            }
        })).data;
    }

    async postEvent(summary, location, description, startTime, endTime, attendees) {
        const settings = await Settings.getInstance();
        const timeZone = await settings.get("time_zone");
        const res = await this.calendar.events.insert({
            calendarId: this.calendarId,
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
                sendUpdates: "all",
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

//     try {
//     const calendarApi = await GoogleCalendarAPI.getInstance();
//
//     let time1 = new Date();
//     let time2 = new Date();
//     time2.setHours(time2.getHours() + 2);
//
//     await calendarApi.postEvent("test event", "30326", "Testing events", time1, time2, [{email: "colbymchenry@gmail.com", responseStatus: "accepted"}]);
// } catch (error) {
//     console.error(error)
// }
}

