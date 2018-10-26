import * as moment from 'moment-timezone';

/*
    Functions for working with dates/moments using my preferred date format, which
    is YYYY-MM-DD and YYYY-MM-DD_HH-MM-SS_Z

    If I need milliseconds I tend to just work with epochs instead
*/

export class DateRatchet {
    public static DEFAULT_DATE_FORMAT: string = 'YYYY-MM-DD';
    public static FULL_DATE_FORMAT: string = 'YYYY-MM-DD_HH_MM_SS';

    public static formatFullDate(input: Date): string {
        return moment(input).format(DateRatchet.FULL_DATE_FORMAT);
    }

    public static formatDefaultDateOnly(input: Date): string {
        return moment(input).format(DateRatchet.DEFAULT_DATE_FORMAT);
    }

    public static parseDefaultDate(input: string): Date {
        return moment(input, DateRatchet.DEFAULT_DATE_FORMAT).toDate();
    }

}
