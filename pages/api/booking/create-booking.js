import {Lead} from "../../../modals/Lead";
import GoogleCalendarAPI from "../../../utils/googleapis/GoogleCalendarAPI";
import {Staff} from "../../../modals/Staff";
import {FirebaseAdmin} from "../../../utils/firebase/FirebaseAdmin";
import {TimeHelper} from "../../../utils/TimeHelper";
import {Settings} from "../../../modals/Settings";
import {TwilioAdmin} from "../../../utils/twilio/TwilioAdmin";
import TextMagicHelper from "../../../utils/textmagic/TextMagicHelper";

export default async function handler(req, res) {
    try {

        const lead = await Lead.get(req.query.id);

        if (!lead) {
            return res.status(400).json({message: "Failed to find Lead data."});
        }

        // getting settings for Google Calendar event creation
        const settings = await Settings.getInstance();
        // grab staff account from DB
        const staff = await Staff.get(req.body.selectedStaff.doc_id);
        // grab staff user account from Firebase
        const staffUserAccount = await FirebaseAdmin.auth().getUser(staff.uid);

        // get services from DB
        const services = await Promise.all(lead.services.map(async ({doc_id}) => {
            const service = await FirebaseAdmin.firestore().collection("clover_inventory").doc(doc_id).get();
            return service.data();
        }));

        // get the start date as the selected time slot and date
        const startDate = new Date(lead.date);
        const [hour, minute] = TimeHelper.sliderValTo24(req.body.selectedTimeSlot).split(":");
        startDate.setHours(parseInt(hour), parseInt(minute), 0);

        // add up service durations to get accurate endTime
        const endDate = new Date(lead.date);
        let totalMinutes = 0;
        services.forEach(({duration}) => totalMinutes += parseInt(duration));
        const addedHours = Math.floor(totalMinutes / 60);
        const addedMinutes = totalMinutes % 60;
        endDate.setHours(parseInt(hour) + addedHours, parseInt(minute) + addedMinutes, 0);

        // setup Google Calendar's event variables
        const location = `${settings.get("address_street_line1")} ${settings.get("address_street_line2")}, ${settings.get("address_city")}, ${settings.get("address_state")} ${settings.get("address_zip")}`;
        const summary = `${settings.get("company_name")} Appointment`;
        const description = `
        Provider: ${staff.firstname} ${staff.lastname}
        Services: ${services.map((service) => service.name).join(", ")}
        `;

        // Get a new Google Calendar API instance
        const calendarApi = await GoogleCalendarAPI.getInstance();

        // post new event to Google Calendar
        const postedEvent = await calendarApi.postEvent(location, summary, description, startDate, endDate, [
            {
                email: staffUserAccount.email
            },
            {
                email: lead.email
            }
        ], {
            staff: staff.doc_id,
            lead: lead.doc_id
        });

        let textMagicId = null;

        try {
            textMagicId = await sendSMSConfirmation(settings, new Date(postedEvent.start.dateTime), postedEvent.start.timeZone, staff, lead.phone);
        } catch (err) {
            console.error(err);
            console.error("Failed to send SMS confirmation.");
        }

        // Add appointment to DB
        await FirebaseAdmin.firestore().collection("appointments").add({
            lead: lead.doc_id,
            staff: staff.doc_id,
            google_event_id: postedEvent.id,
            google_event_link: postedEvent.htmlLink,
            start: postedEvent.start,
            end: postedEvent.end,
            services: lead.services.map(({doc_id}) => doc_id),
            ...(textMagicId && { text_magic_reminder_id: textMagicId })
        });

        return res.json(
            {
                start: postedEvent.start,
                end: postedEvent.end
            }
        )
    } catch (error) {
        console.error(error)
        if (error?.code) {
            return res.status(400).json({code: error.code, message: error.message})
        } else {
            return res.status(500).json({})
        }
    }

}

async function sendSMSConfirmation(settings, startDate, timeZone, staff, toPhone) {
    const dateHuman = startDate.toLocaleTimeString([], {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone
    });
    const textBody = `\n\nYour appointment on\n\n${dateHuman} with ${staff?.firstname ? staff.firstname : ""} ${staff?.lastname ? staff.lastname : ""} is scheduled.\n\nAddress:\n${settings.get("address_street_line1") && settings.get("address_street_line1") + "\n"}${settings.get("address_street_line2") && settings.get("address_street_line2") + "\n"}${settings.get("address_city") && settings.get("address_city") + ", "}${settings.get("address_state") && settings.get("address_state")} ${settings.get("address_zip") && settings.get("address_zip")}\n\nThanks for choosing ${settings.get("company_name")}! We look forward to seeing you!`;
    await TwilioAdmin.sendText(toPhone, settings.get("company_name") + textBody);

   // TODO: Scheduler can't do past 7 days
    const reminderDate = new Date(startDate);
    reminderDate.setHours(8, 0, 30);

    const textMagic = await TextMagicHelper.getInstance();
    const resp = await textMagic.sendMessage({
        text: textBody,
        phones: toPhone,
        sendingDateTime: formatDate(reminderDate),
        sendingTimeZone: timeZone
    });

    return resp.scheduleId;
}

function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
}

function formatDate(date) {
    return (
        [
            date.getFullYear(),
            padTo2Digits(date.getMonth() + 1),
            padTo2Digits(date.getDate()),
        ].join('-') +
        ' ' +
        [
            padTo2Digits(date.getHours()),
            padTo2Digits(date.getMinutes()),
            padTo2Digits(date.getSeconds()),
        ].join(':')
    );
}
