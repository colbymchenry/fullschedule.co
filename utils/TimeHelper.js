
export class TimeHelper {

    static sliderValTo24(mark) {
        return mark.toString().includes(".") ? mark.toString().split(".")[0] + ":" + (60 * parseFloat("0." + mark.toString().split(".")[1])) : mark + ":00";
    }

    static convertTime24to12(time24h) {
        let [hours, minutes] = time24h.split(':');
        let AmOrPm = hours >= 12 ? 'PM' : 'AM';
        hours = (hours % 12) || 12;

        if (hours === undefined || minutes === undefined) return ""

        return  hours + ":" + (minutes == "0" ? "00" : minutes.length === 1 ? "0" + minutes : minutes) + " " + AmOrPm;
    }

    static convertTime12to24(time12h) {
        const [time, modifier] = time12h.split(' ');

        let [hours, minutes] = time.split(':');

        if (hours === '12') {
            hours = '00';
        }

        if (modifier === 'PM') {
            hours = parseInt(hours, 10) + 12;
        }

        if (hours === undefined || minutes === undefined) return ""

        if (minutes === '60') {
            hours = parseInt(hours) + 1
            if (hours > 24) {
                hours = "00"
            }
        }

        return `${hours}:${minutes == "0" ? "00" : minutes}`;
    }

    static minuteDiff(time_start, time_end) {
        let [hourStart, minuteStart] = time_start.split(":")
        let [hourEnd, minuteEnd] = time_end.split(":")
        hourStart = parseInt(hourStart)
        minuteStart = parseInt(minuteStart)
        hourEnd = parseInt(hourEnd)
        minuteEnd = parseInt(minuteEnd)

        let minutes = (hourEnd - hourStart) * 60;
        minutes += minuteEnd - minuteStart;
        return minutes;
    }
}