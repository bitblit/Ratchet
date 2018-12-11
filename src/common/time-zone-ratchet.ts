import * as moment from 'moment-timezone';

/*
    Functions for working with dates specifically a given time zone
*/

export class TimeZoneRatchet {
    public static PACIFIC = new TimeZoneRatchet('America/Los_Angeles');
    private timezone: string;

    constructor(timezone: string) {
        if (!timezone) {
            throw 'Timezone cannot be null';
        }
        // TODO : should check if valid here
        this.timezone = timezone;
    }

    // Returns 0-23
    public currentHour(): number {
        let rval = moment().tz(this.timezone).hour();
        return rval;
    }

    // Returns midnight in the current timezone in epoch seconds
    public startOfTodayEpochSeconds(): number {
        let startOfToday = moment().tz(this.timezone).hour(0).minute(0).second(0).millisecond(0).unix();
        return startOfToday;
    }

    // Returns midnight of the passed timestamp in the current timezone in epoch seconds
    public startOfMatchingDayEpochSeconds(inputTS: number): number {
        let startOfToday = moment(inputTS).tz(this.timezone).hour(0).minute(0).second(0).millisecond(0).unix();
        return startOfToday;
    }

    // Returns midnight of the passed timestamp in the current timezone in epoch ms
    public startOfMatchingDayEpochMS(inputTS: number): number {
        return this.startOfMatchingDayEpochSeconds(inputTS)*1000;
    }

    // Returns the start of the current hour in epoch seconds
    public startOfCurrentHourEpochSeconds(): number {
        let rval = moment().tz(this.timezone).minute(0).second(0).millisecond(0).unix();
        return rval;
    }

    // Returns midnight in the current timezone in epoch seconds
    public startOfTodayEpochMS(): number {
        let startOfToday = moment().tz(this.timezone).hour(0).minute(0).second(0).millisecond(0).toDate().getTime();
        return startOfToday;
    }

    /**
     * Returns the number of slots in a day (simple math)
     * @param {number} slotWidthMs
     * @returns {number} containing the number of slots in a day (last one may be partial)
     */
    public dailySlotCount(slotWidthMs: number): number {
        return Math.ceil(86400000 / slotWidthMs);
    }

    /**
     * Imagine a day cut into N 'slots', each slotWidthMS wide - then there are
     * 86,400,000 / slotWidthMS slots available, indexed from 0 on up.  This function
     * returns that index
     * @param {number} slotWidthMs
     * @returns {number} containing the current index
     */
    public currentTimeSlotIdx(slotWidthMs: number): number {
        if (slotWidthMs < 1) {
            throw new Error('Cannot process with slot less than one ms wide');
        }

        let startOfToday = this.startOfTodayEpochMS();
        let now = new Date().getTime();
        let delta = now - startOfToday;
        let idx = Math.floor(delta / slotWidthMs);
        return idx;
    }

    /**
     * Imagine a day cut into N 'slots', each slotWidthMS wide - then there are
     * 86,400,000 / slotWidthMS slots available, indexed from 0 on up.  This function
     * returns that index
     * @param {number} slotWidthMs
     * @returns {number} containing the current index
     */
    public matchingTimeSlotIdx(timestamp: number, slotWidthMs: number): number {
        if (slotWidthMs < 1) {
            throw new Error('Cannot process with slot less than one ms wide');
        }

        let startOfDay = this.startOfMatchingDayEpochMS(timestamp);
        let delta = timestamp - startOfDay;

        let idx = Math.floor(delta / slotWidthMs);
        return idx;
    }

    /**
     * Given the definition of slotWidth and currentTimeSlotIdx from above, return the ms that is the
     * start of the slot that "now" falls within.
     * @param {number} slotWidthMs
     * @returns {number}
     */
    public startOfCurrentSlotEpochMS(slotWidthMs: number): number {
        let startOfToday = this.startOfTodayEpochMS();
        let currentIdx = this.currentTimeSlotIdx(slotWidthMs);
        return startOfToday + (currentIdx * slotWidthMs);
    }

    /**
     * Given the definition of slotWidth and currentTimeSlotIdx from above, return the ms that is the
     * start of the slot that the passed timestamp falls within.
     * @param {number} slotWidthMs
     * @returns {number}
     */
    public startOfMatchingSlotEpochMS(timestamp: number, slotWidthMs: number): number {
        let startOfDay = this.startOfMatchingDayEpochSeconds(timestamp);
        let currentIdx = this.matchingTimeSlotIdx(timestamp, slotWidthMs);
        return startOfDay + (currentIdx * slotWidthMs);
    }

}
