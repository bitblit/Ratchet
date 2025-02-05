import { DurationRatchet } from './duration-ratchet.js';
import { DateTime } from 'luxon';
import { describe, expect, test } from 'vitest';

describe('#formatMsDuration', function () {
  test('should format less than one second', function () {
    const result = DurationRatchet.formatMsDuration(409, true);
    expect(result).toEqual('00h00m00.409s');
  });
  test('should format more than one day', function () {
    const result = DurationRatchet.formatMsDuration(1000 * 60 * 60 * 123, true);
    expect(result).toEqual('5d03h00m00.000s');
  });
});

describe('#colonFormatMsDuration', function () {
  test('should format less than one second', function () {
    const result = DurationRatchet.colonFormatMsDuration(409, true);
    expect(result).toEqual('00:00:00.409');
  });

  test('should format more than ten hours', function () {
    const result = DurationRatchet.colonFormatMsDuration(1000 * 60 * 60 * 11, false);
    expect(result).toEqual('11:00:00');
  });

  test('should format more than one hundred hours', function () {
    const result = DurationRatchet.colonFormatMsDuration(1000 * 60 * 60 * 123, false);
    expect(result).toEqual('123:00:00');
  });

  test('should format 15 seconds', function () {
    const result = DurationRatchet.colonFormatMsDuration(15000, false);
    expect(result).toEqual('00:00:15');
  });
});

describe('#createSteps', function () {
  test('should create steps', function () {
    const startEpochMS: number = DateTime.fromFormat('2019-01-01', 'yyyy-MM-dd').toJSDate().getTime();
    const endEpochMS: number = DateTime.fromFormat('2019-01-05', 'yyyy-MM-dd').toJSDate().getTime();

    const steps: string[] = DurationRatchet.createSteps(startEpochMS, endEpochMS, 'etc/GMT', 'yyyy-MM-dd', { days: 1 });

    expect(steps.length).toEqual(4);
  });
});
