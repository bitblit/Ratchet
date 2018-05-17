import * as moment from 'moment-timezone';
import {NumberRatchet} from "./number-ratchet";

/*
    Functions for working with durations (times between times)
*/

export class DurationRatchet {

    public static formatMsDuration(ms:number, includeMS:boolean =false): string {
        let rem_ms = (ms % 1000);
        let seconds = Math.floor(ms / 1000) % 60;
        let minutes = Math.floor(ms / (1000 * 60)) % 60;
        let hours = Math.floor(ms / (1000 * 60 * 60)) % 24;

        let f = NumberRatchet.leadingZeros;
        let rval=f(hours, 2)+"h"+f(minutes,2)+"m";
        rval+=(includeMS)?f(seconds, 2)+"."+f(rem_ms,3)+"s":f(seconds, 2)+"s";
        return rval;
    }

    public static colonFormatMsDuration(ms:number, includeMS:boolean =false): string {
        let rem_ms = (ms % 1000);
        let seconds = Math.floor(ms / 1000) % 60;
        let minutes = Math.floor(ms / (1000 * 60)) % 60;
        let hours = Math.floor(ms / (1000 * 60 * 60)) % 24;

        let f = NumberRatchet.leadingZeros;
        let rval=f(hours, 2)+":"+f(minutes,2)+":";
        rval+=(includeMS)?f(seconds, 2)+"."+f(rem_ms,3):f(seconds, 2);
        return rval;
    }

    public static daysBetween(d1: Date, d2: Date) : number
    {
        return moment(d1).diff(moment(d2), 'days');
    }

}
