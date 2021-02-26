import moment from 'moment-timezone';
import { DurationInputArg2, Moment } from 'moment-timezone';
import { NumberRatchet } from './number-ratchet';

/*
    Functions for working with durations (times between times)
*/

export class DurationRatchet {
  public static formatMsDuration(ms: number, includeMS = false): string {
    const rem_ms = Math.floor(ms % 1000);
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / (1000 * 60)) % 60;
    const hours = Math.floor(ms / (1000 * 60 * 60)) % 24;
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    const f = NumberRatchet.leadingZeros;
    let rval = f(hours, 2) + 'h' + f(minutes, 2) + 'm';
    rval += includeMS ? f(seconds, 2) + '.' + f(rem_ms, 3) + 's' : f(seconds, 2) + 's';
    if (days > 0) {
      rval = days + 'd' + rval;
    }
    return rval;
  }

  public static colonFormatMsDuration(ms: number, includeMS = false): string {
    const rem_ms = ms % 1000;
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / (1000 * 60)) % 60;
    const hours = Math.floor(ms / (1000 * 60 * 60));

    const f = NumberRatchet.leadingZeros;
    let rval = f(hours, 2) + ':' + f(minutes, 2) + ':';
    rval += includeMS ? f(seconds, 2) + '.' + f(rem_ms, 3) : f(seconds, 2);
    return rval;
  }

  public static daysBetween(d1: Date, d2: Date): number {
    return moment(d1).diff(moment(d2), 'days');
  }

  public static createSteps(
    startEpochMS: number,
    endEpochMS: number,
    timezone: string,
    outputFormat: string,
    stepUnit: DurationInputArg2
  ): string[] {
    let curDate: Moment = moment.tz(startEpochMS, timezone);
    const endDate: Moment = moment(endEpochMS);

    const rval: string[] = [];
    while (curDate.isBefore(endDate)) {
      rval.push(curDate.format(outputFormat));
      curDate = curDate.add('1', stepUnit);
    }

    return rval;
  }
}
