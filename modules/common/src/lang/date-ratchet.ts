import { DateTime } from 'luxon';

/*
    Functions for working with dates/moments using my preferred date format, which
    is yyyy-MM-dd and yyyy-MM-dd_HH-mm-ss_z

    If I need milliseconds I tend to just work with epochs instead
*/

export class DateRatchet {
  public static COMMON_US_DATE_FORMAT = 'MM/dd/yyyy';
  public static DEFAULT_DATE_FORMAT = 'yyyy-MM-dd';
  public static FULL_DATE_FORMAT = 'yyyy-MM-dd_HH_mm_ss';

  public static PACIFIC_TIME_ZONE: string = 'America/Los_Angeles';
  public static UTC_TIME_ZONE: string = 'etc/UTC';

  public static formatFullDate(input: Date): string {
    return DateTime.fromJSDate(input).toFormat(DateRatchet.FULL_DATE_FORMAT);
  }

  public static formatDefaultDateOnly(input: Date): string {
    return DateTime.fromJSDate(input).toFormat(DateRatchet.DEFAULT_DATE_FORMAT);
  }

  public static parseDefaultDate(input: string): Date {
    const rval: Date = DateTime.fromFormat(input, DateRatchet.DEFAULT_DATE_FORMAT).toJSDate();
    return rval;
  }

  public static parseCommonUsDate(input: string): Date {
    let rval: Date = null;
    if (!!input) {
      let templ: string = DateRatchet.COMMON_US_DATE_FORMAT;
      if (input.indexOf('-') === 2) {
        templ = templ.split('/').join('-');
      }
      rval = DateTime.fromFormat(input, templ).toJSDate();
    }
    return rval;
  }
}
