import { RequireRatchet } from '@bitblit/ratchet-common/lang/require-ratchet';
import { ErrorRatchet } from '@bitblit/ratchet-common/lang/error-ratchet';
import { StringRatchet } from '@bitblit/ratchet-common/lang/string-ratchet';
import { ScheduledEvent } from 'aws-lambda';
import { DateTime } from 'luxon';
import { AbstractCronEntry } from '../config/cron/abstract-cron-entry.js';
import { CronConfig } from '../config/cron/cron-config.js';

export class CronUtil {
  public static everyNMinuteFilter(n: number): number[] {
    return CronUtil.everyNElementFilter(n, 60);
  }

  public static everyNDaysOfYearFilter(n: number): number[] {
    return CronUtil.everyNElementFilter(n, 365);
  }

  public static everyNElementFilter(n: number, m: number): number[] {
    RequireRatchet.notNullOrUndefined(n);
    RequireRatchet.notNullOrUndefined(m);
    const half: number = Math.floor(m / 2);

    if (!n || n < 2 || n > half || m % n !== 0) {
      ErrorRatchet.throwFormattedErr(
        'Invalid config - this function only makes sense for 2 < N < %d and %d evenly divisible by N',
        half,
        m,
      );
      throw new Error('Invalid config - this function only makes sense for 2 < N < 31 and 60 evenly divisible by N');
    }
    const rval: number[] = [];
    for (let i = 0; i < 60; i += n) {
      rval.push(i);
    }
    return rval;
  }

  public static numberMatchesFilter(num: number, filter: number[]): boolean {
    return !filter || filter.length === 0 || filter.includes(num);
  }

  public static eventMatchesEntry(
    event: ScheduledEvent,
    entry: AbstractCronEntry,
    cfg: CronConfig,
    testTimeEpochMS: number = new Date().getTime(),
  ): boolean {
    let rval: boolean = false;
    if (!!event && !!entry && !!cfg.timezone) {
      if (!!event.resources && event.resources.length > 0) {
        const eventSourceName: string = event.resources[0];
        const targetTZ: string = StringRatchet.trimToNull(entry.overrideTimezone) || cfg.timezone;
        const nowInTZ: DateTime = DateTime.fromMillis(testTimeEpochMS).setZone(targetTZ);
        rval = !entry.eventFilter || entry.eventFilter.test(eventSourceName);
        rval = rval && CronUtil.numberMatchesFilter(nowInTZ.minute, entry.minuteFilter);
        rval = rval && CronUtil.numberMatchesFilter(nowInTZ.hour, entry.hourFilter);
        rval = rval && CronUtil.numberMatchesFilter(nowInTZ.weekday, entry.dayOfWeekFilter);
        rval = rval && CronUtil.numberMatchesFilter(nowInTZ.day, entry.dayOfMonthFilter);
        rval = rval && CronUtil.numberMatchesFilter(nowInTZ.month, entry.monthOfYearFilter);
        rval = rval && (!entry.contextMatchFilter || entry.contextMatchFilter.test(StringRatchet.trimToEmpty(cfg.context)));
        rval = rval && (!entry.contextNoMatchFilter || !entry.contextNoMatchFilter.test(StringRatchet.trimToEmpty(cfg.context)));
      }
    }

    return rval;
  }

  public static cronEntryName(entry: AbstractCronEntry, idx: number = null): string {
    RequireRatchet.notNullOrUndefined(entry);
    let rval: string = null;
    if (entry) {
      rval = entry.name;
      rval = rval || entry['backgroundTaskType'];
      if (!rval && !!entry['directHandler']) {
        if (idx) {
          rval = 'Direct Entry ' + idx;
        } else {
          rval = 'Direct Entry (No idx specified)';
        }
      }
    } else {
      rval = 'ERROR: no entry passed';
    }
    return rval;
  }
}
