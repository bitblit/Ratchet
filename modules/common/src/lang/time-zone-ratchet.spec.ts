import { TimeZoneRatchet } from './time-zone-ratchet.js';
import { expect, test, describe } from 'vitest';

const tz: TimeZoneRatchet = TimeZoneRatchet.PACIFIC;

describe('#currentHour', function () {
  test('should return 0- 23', function () {
    const result: number = tz.currentHour();
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(23);
  });
});

describe('#startOfTodayEpochSeconds', function () {
  test('should never be more than now or more than 86400 seconds in the past', function () {
    const now: number = tz.nowEpochSeconds();//  Math.floor(new Date().getTime() / 1000);
    const start: number = tz.startOfTodayEpochSeconds();
    const result: number = now - start;
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(86400);
  });
});

describe('#dailySlotCount', function () {
  test('should return 86400', function () {
    const result: number = tz.dailySlotCount(1000);
    expect(result).toEqual(86400);
  });
});

describe('#currentTimeSlotIdx', function () {
  // CAW 2020-11-01 : This actually fails on the day of spring forward/fall back because of the extra hour!
  test.skip('should return same as current hour', function () {
    const curHour: number = tz.currentHour();
    const hourSlot: number = 1000 * 60 * 60;
    const curSlot: number = tz.currentTimeSlotIdx(hourSlot);

    expect(curSlot).toEqual(curHour);
  });
});

describe('#matchingTimeSlotIdx', function () {
  // CAW 2020-11-01 : This actually fails on the day of spring forward/fall back because of the extra hour!
  test.skip('should return same as current hour', function () {
    const curHour: number = tz.currentHour();
    const hourSlot: number = 1000 * 60 * 60;
    const matchSlot: number = tz.matchingTimeSlotIdx(new Date().getTime(), hourSlot);

    expect(matchSlot).toEqual(curHour);
  });
});
