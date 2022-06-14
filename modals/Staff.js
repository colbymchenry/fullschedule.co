import {FirebaseAdmin} from "../utils/firebase/FirebaseAdmin";

export class Staff {

    constructor(data) {
        this.data = data;
    }

    async setSchedule(schedule) {
        await FirebaseAdmin.firestore().collection("staff").doc(this.data.doc_id).update({
           "schedule": schedule
        });
    }

    static async create(email, password, firstname, lastname, avatar, services) {
        const user = await FirebaseAdmin.auth().createUser({
            email: email.toLowerCase(),
            emailVerified: true,
            password,
            displayName: firstname + " " + lastname,
            ...(avatar && {photoURL: avatar}),
            disabled: false,
        });

        const staff = await FirebaseAdmin.firestore().collection("staff").add({
            firstname,
            lastname,
            ...(services && {services}),
            uid: user.uid
        });

        return (await FirebaseAdmin.firestore().collection("staff").doc(staff.id).get()).data();
    }

    static async get(id) {
        if (id) {
            const doc = await FirebaseAdmin.firestore().collection("staff").doc(id).get();
            return {...doc.data(), doc_id: id};
        } else {
            const docs = await FirebaseAdmin.firestore().collection("staff").get();
            let staff = [];
            docs.forEach((doc) => {
                staff.push({...doc.data(), doc_id: doc.id});
            });
            return staff;
        }
    }

    static async delete(id) {
        return await FirebaseAdmin.firestore().collection("staff").doc(id).delete();
    }

    getAvailableTimeSlots(day, step) {
        if (!this.data["schedule"] || !this.data.schedule[day]) return undefined;

        const schedule = this.data.schedule[day];
        const dayStart = schedule.day[0];
        const dayEnd = schedule.day[1];
        const lunchStart = !schedule["lunch"] ? undefined : schedule?.lunch[0];
        const lunchEnd = !schedule["lunch"] ? undefined : schedule?.lunch[1];

        const hours = [];

        // get all available time slots accounting for lunch break
        for (let timeSlot = dayStart; timeSlot <= dayEnd; timeSlot+= (step / 60)) {
            if (lunchStart && lunchEnd) {
                if (!(lunchStart <= timeSlot && lunchEnd >= timeSlot)) {
                    hours.push(timeSlot.toFixed(2));
                }
            } else {
                hours.push(timeSlot.toFixed(2));
            }
        }

        return hours;
    }
}