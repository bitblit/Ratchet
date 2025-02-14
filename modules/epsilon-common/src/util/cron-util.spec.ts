import { ScheduledEvent } from 'aws-lambda';
import fs from 'fs';
import path from 'path';
import { CronUtil } from './cron-util.js';
import { CronConfig } from '../config/cron/cron-config.js';
import { AbstractCronEntry } from '../config/cron/abstract-cron-entry.js';
import { EsmRatchet } from '@bitblit/ratchet-common/lang/esm-ratchet';
import { describe, expect, test } from 'vitest';

describe('#cronUtil', function () {
  test('should test matching event to entry', async () => {
    const sEvent: ScheduledEvent = JSON.parse(
      fs
        .readFileSync(
          path.join(EsmRatchet.fetchDirName(import.meta.url), '../../../../test-data/epsilon/sample-json/sample-schedule-event-1.json'),
        )
        .toString(),
    );

    const cfg: CronConfig = {
      context: 'prod',
      timezone: 'America/Los_Angeles',
      entries: [], // only works since this isn't checked
    };

    const cron1: AbstractCronEntry = {
      contextMatchFilter: new RegExp('prod'),
    };

    const match1: boolean = CronUtil.eventMatchesEntry(sEvent, cron1, cfg);
    expect(match1).toBeTruthy();

    const cron2: AbstractCronEntry = {
      contextMatchFilter: new RegExp('dev'),
    };

    const match2: boolean = CronUtil.eventMatchesEntry(sEvent, cron2, cfg);
    expect(match2).toBeFalsy();

    const cron3: AbstractCronEntry = {
      eventFilter: new RegExp('.*MyScheduledRule.*'),
    };

    const match3: boolean = CronUtil.eventMatchesEntry(sEvent, cron3, cfg);
    expect(match3).toBeTruthy();

    const cron4: AbstractCronEntry = {
      eventFilter: new RegExp('.*NotMyRule.*'),
    };

    const match4: boolean = CronUtil.eventMatchesEntry(sEvent, cron4, cfg);
    expect(match4).toBeFalsy();
  });

  test('should match times', async () => {
    const sEvent: ScheduledEvent = JSON.parse(
      fs
        .readFileSync(
          path.join(EsmRatchet.fetchDirName(import.meta.url), '../../../../test-data/epsilon/sample-json/sample-schedule-event-1.json'),
        )
        .toString(),
    );
    const cfg: CronConfig = {
      context: 'prod',
      timezone: 'America/Los_Angeles',
      entries: [], // only works since this isn't checked
    };

    const _entry1: AbstractCronEntry = {};

    const cron1: AbstractCronEntry = {
      contextMatchFilter: new RegExp('prod'),
    };

    const match1: boolean = CronUtil.eventMatchesEntry(sEvent, cron1, cfg);
    expect(match1).toBeTruthy();

    const cron2: AbstractCronEntry = {
      contextMatchFilter: new RegExp('dev'),
    };

    const match2: boolean = CronUtil.eventMatchesEntry(sEvent, cron2, cfg);
    expect(match2).toBeFalsy();

    const cron3: AbstractCronEntry = {
      eventFilter: new RegExp('.*MyScheduledRule.*'),
    };

    const match3: boolean = CronUtil.eventMatchesEntry(sEvent, cron3, cfg);
    expect(match3).toBeTruthy();

    const cron4: AbstractCronEntry = {
      eventFilter: new RegExp('.*NotMyRule.*'),
    };

    const match4: boolean = CronUtil.eventMatchesEntry(sEvent, cron4, cfg);
    expect(match4).toBeFalsy();
  });

  test('should match time with override', async () => {
    const sEvent: ScheduledEvent = JSON.parse(
      fs
        .readFileSync(
          path.join(EsmRatchet.fetchDirName(import.meta.url), '../../../../test-data/epsilon/sample-json/sample-schedule-event-1.json'),
        )
        .toString(),
    );
    const cfg: CronConfig = {
      context: 'prod',
      timezone: 'America/Los_Angeles',
      entries: [], // only works since this isn't checked
    };

    const _entry1: AbstractCronEntry = {};

    const cron1: AbstractCronEntry = {
      hourFilter: [3],
    };

    const cron2: AbstractCronEntry = {
      overrideTimezone: 'etc/utc',
      hourFilter: [3],
    };

    //Timestamp in milliseconds: 1652931000000
    //Date and time (GMT): Thursday, May 19, 2022 3:30:00 AM
    const testTimestampEpochMS: number = 1652931000000;

    const match1: boolean = CronUtil.eventMatchesEntry(sEvent, cron1, cfg, testTimestampEpochMS);
    const match2: boolean = CronUtil.eventMatchesEntry(sEvent, cron2, cfg, testTimestampEpochMS);
    expect(match1).toBeFalsy();
    expect(match2).toBeTruthy();
  });

  test('should match day of month filters', async () => {
    const sEvent: ScheduledEvent = JSON.parse(
      fs
        .readFileSync(
          path.join(EsmRatchet.fetchDirName(import.meta.url), '../../../../test-data/epsilon/sample-json/sample-schedule-event-1.json'),
        )
        .toString(),
    );
    const cfg: CronConfig = {
      context: 'prod',
      timezone: 'etc/utc',
      entries: [], // only works since this isn't checked
    };

    const _entry1: AbstractCronEntry = {};

    //Timestamp in milliseconds: 1652931000000
    //Date and time (GMT): Thursday, May 19, 2022 3:30:00 AM
    const testTimestampEpochMS: number = 1652931000000;

    const dayOfMonth: AbstractCronEntry = {
      dayOfMonthFilter: [19],
    };

    const matchDay: boolean = CronUtil.eventMatchesEntry(sEvent, dayOfMonth, cfg, testTimestampEpochMS);
    expect(matchDay).toBeTruthy();
  });

  test('should match month of year filter', async () => {
    const sEvent: ScheduledEvent = JSON.parse(
      fs
        .readFileSync(
          path.join(EsmRatchet.fetchDirName(import.meta.url), '../../../../test-data/epsilon/sample-json/sample-schedule-event-1.json'),
        )
        .toString(),
    );
    const cfg: CronConfig = {
      context: 'prod',
      timezone: 'etc/utc',
      entries: [], // only works since this isn't checked
    };

    const _entry1: AbstractCronEntry = {};

    //Timestamp in milliseconds: 1652931000000
    //Date and time (GMT): Thursday, May 19, 2022 3:30:00 AM
    const testTimestampEpochMS: number = 1652931000000;

    const monthOfYear: AbstractCronEntry = {
      monthOfYearFilter: [5],
    };

    const matchMonth: boolean = CronUtil.eventMatchesEntry(sEvent, monthOfYear, cfg, testTimestampEpochMS);
    expect(matchMonth).toBeTruthy();
  });
});
