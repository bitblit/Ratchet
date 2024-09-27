import { ExpiringObject } from './expiring-object.js';
import { PromiseRatchet } from './promise-ratchet.js';
import { LoggerLevelName } from '../logger/logger-level-name.js';
import { expect, test, describe } from 'vitest';

describe('#expiringObject', function () {
  test('should default the object', async () => {
    const expObject: ExpiringObject<number> = new ExpiringObject<number>({
      initialValue: 7,
      timeToLiveMS: 50_000,
      logLevel: LoggerLevelName.info,
    });
    const val: number = await expObject.fetch();
    expect(val).toEqual(7);
  });

  test('should expire the object', async () => {
    const expObject: ExpiringObject<number> = new ExpiringObject<number>({
      initialValue: 7,
      timeToLiveMS: 100,
      logLevel: LoggerLevelName.info,
    });
    const val: number = await expObject.fetch();
    expect(val).toEqual(7);
    await PromiseRatchet.wait(101);
    const val2: number = await expObject.fetch();
    expect(val2).toBeNull();
  });

  test('should regen the object', async () => {
    const expObject: ExpiringObject<number> = new ExpiringObject<number>({
      initialValue: 7,
      timeToLiveMS: 100,
      generator: async () => 8,
      logLevel: LoggerLevelName.info,
    });
    const val: number = await expObject.fetch();
    expect(val).toEqual(7);
    await PromiseRatchet.wait(101);
    const val2: number = await expObject.fetch();
    expect(val2).toEqual(8);
  });

  test('should return time remaining', async () => {
    const expObject: ExpiringObject<number> = new ExpiringObject<number>({
      initialValue: 7,
      timeToLiveMS: 10_000,
      logLevel: LoggerLevelName.info,
    });
    const val: number = await expObject.fetch();
    expect(val).toEqual(7);
    const rem: number = await expObject.fetchCacheObjectTimeRemainingMS();
    expect(rem).toBeGreaterThan(0);
    expect(rem).toBeLessThanOrEqual(10_000);
  });
});
