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
        calendarApi.calendarId = settings.get("google_calendar_id");
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

//     $event = new Google_Service_Calendar_Event(array(
//         'summary' => 'Google I/O 2015',
//     'location' => '800 Howard St., San Francisco, CA 94103',
//     'description' => 'A chance to hear more about Google\'s developer products.',
//     'start' => array(
//     'dateTime' => '2015-05-28T09:00:00-07:00',
//     'timeZone' => 'America/Los_Angeles',
// ),
//     'end' => array(
//     'dateTime' => '2015-05-28T17:00:00-07:00',
//     'timeZone' => 'America/Los_Angeles',
// ),
//     'recurrence' => array(
//     'RRULE:FREQ=DAILY;COUNT=2'
// ),
//     'attendees' => array(
//         array('email' => 'lpage@example.com'),
//     array('email' => 'sbrin@example.com'),
// ),
//     'reminders' => array(
//     'useDefault' => FALSE,
//     'overrides' => array(
//         array('method' => 'email', 'minutes' => 24 * 60),
//     array('method' => 'popup', 'minutes' => 10),
// ),
// ),
// ));
    async postEvent(location, summary, description, startTime, endTime, attendees, extendedProperties) {
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
                },
                extendedProperties: {
                    private: extendedProperties
                }
            }
        });

        console.log("CREATION", {
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
            extendedProperties: {
                private: extendedProperties
            }
        })

        return res.data;
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

