import { DateTime } from 'luxon';

/*
    Functions for working with dates specifically a given time zone
    TODO: Refactor the 'today' slots to work in terms of the 'matching' slot endpoints
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
    const rval = DateTime.local().setZone(this.timezone).hour;
    return rval;
  }

  private toEpochSeconds(dt: DateTime) {
    return Math.round(dt.toMillis() / 1000);
  }

  // Returns midnight in the current timezone in epoch seconds
  public startOfTodayEpochSeconds(): number {
    const startOfToday = this.toEpochSeconds(
      DateTime.local().setZone(this.timezone).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }),
    );
    return startOfToday;
  }

  // Returns midnight of the passed timestamp in the current timezone in epoch seconds
  public startOfMatchingDayEpochSeconds(inputTS: number): number {
    const startOfToday = this.toEpochSeconds(DateTime.fromMillis(inputTS).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }));
    return startOfToday;
  }

  // Returns midnight of the passed timestamp in the current timezone in epoch ms
  public startOfMatchingDayEpochMS(inputTS: number): number {
    return this.startOfMatchingDayEpochSeconds(inputTS) * 1000;
  }

  // Returns the start of the current hour in epoch seconds
  public startOfCurrentHourEpochSeconds(): number {
    const rval = this.toEpochSeconds(DateTime.local().setZone(this.timezone).set({ minute: 0, second: 0, millisecond: 0 }));
    return rval;
  }

  // Returns the start of the current minute in epoch seconds
  public startOfCurrentMinuteEpochSeconds(): number {
    const rval = this.toEpochSeconds(DateTime.local().setZone(this.timezone).set({ second: 0, millisecond: 0 }));
    return rval;
  }

  // Returns the start of the current second in epoch seconds
  public startOfCurrentSecondEpochSeconds(): number {
    const rval = this.toEpochSeconds(DateTime.local().setZone(this.timezone).set({ millisecond: 0 }));
    return rval;
  }

  // Returns midnight in the current timezone in epoch ms
  public startOfTodayEpochMS(): number {
    const startOfToday = DateTime.local().setZone(this.timezone).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toMillis();
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

    const startOfToday = this.startOfTodayEpochMS();
    const now = new Date().getTime();
    const delta = now - startOfToday;
    const idx = Math.floor(delta / slotWidthMs);
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

    const startOfDay = this.startOfMatchingDayEpochMS(timestamp);
    const delta = timestamp - startOfDay;

    const idx = Math.floor(delta / slotWidthMs);
    return idx;
  }

  /**
   * Given the definition of slotWidth and currentTimeSlotIdx from above, return the ms that is the
   * start of the slot that "now" falls within.
   * @param {number} slotWidthMs
   * @returns {number}
   */
  public startOfCurrentSlotEpochMS(slotWidthMs: number): number {
    const startOfToday = this.startOfTodayEpochMS();
    const currentIdx = this.currentTimeSlotIdx(slotWidthMs);
    return startOfToday + currentIdx * slotWidthMs;
  }

  /**
   * Given the definition of slotWidth and currentTimeSlotIdx from above, return the ms that is the
   * start of the slot that the passed timestamp falls within.
   * @param {number} slotWidthMs
   * @returns {number}
   */
  public startOfMatchingSlotEpochMS(timestamp: number, slotWidthMs: number): number {
    const startOfDay = this.startOfMatchingDayEpochMS(timestamp);
    const currentIdx = this.matchingTimeSlotIdx(timestamp, slotWidthMs);
    return startOfDay + currentIdx * slotWidthMs;
  }
}
