import { DateTime, Duration, DurationLike } from 'luxon';
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
    const dur: Duration = DateTime.fromJSDate(d1).diff(DateTime.fromJSDate(d2));
    return dur.days;
  }

  public static createSteps(
    startEpochMS: number,
    endEpochMS: number,
    timezone: string,
    outputFormat: string,
    stepUnit: DurationLike,
  ): string[] {
    let curDate: DateTime = DateTime.fromMillis(startEpochMS).setZone(timezone);
    const endDate: DateTime = DateTime.fromMillis(endEpochMS);

    const rval: string[] = [];
    while (curDate < endDate) {
      rval.push(curDate.toFormat(outputFormat));
      curDate = curDate.plus(stepUnit);
    }

    return rval;
  }
}
