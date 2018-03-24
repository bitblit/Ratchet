import * as moment from 'moment-timezone';
import {NumberRatchet} from "./number-ratchet";

/*
    Functions for working with dates specifically a given time zone
*/

export class TimeZoneRatchet {
    public static PACIFIC = new TimeZoneRatchet('America/Los_Angeles');
    private timezone : string;

    constructor(timezone:string)
    {
        if (!timezone)
        {
            throw "Timezone cannot be null";
        }
        // TODO : should check if valid here
        this.timezone = timezone;
    }

    // Returns 0-23
    public currentHour() : number{
        let rval = moment().tz(this.timezone).hour();
        return rval;
    }

    // Returns midnight in the current timezone in epoch seconds
    public startOfTodayEpochSeconds() : number{
        let startOfToday = moment().tz(this.timezone).hour(0).minute(0).second(0).millisecond(0).unix();
        return startOfToday;
    }

    // Returns the start of the current hour in epoch seconds
    public startOfCurrentHourEpochSeconds() : number {
        let rval = moment().tz(this.timezone).minute(0).second(0).millisecond(0).unix();
        return rval;
    }

}
