import { PromiseRatchet } from './promise-ratchet.js';
import { Logger } from '../logger/logger.js';
import { TimeoutToken } from './timeout-token.js';
import { LoggerLevelName } from '../logger/logger-level-name.js';
import { expect, test, describe } from 'vitest';

const fnFalse = (_ignored) => {
  return false;
};
const fnOn3 = (t) => {
  Logger.info('t=%d', t);
  return t == 3;
};
const waitAndPrint = async (t1: number, t2: string) => {
  Logger.info('Running: %s', t2);
  await PromiseRatchet.wait(t1 * 2);
  return t1 * 2;
};

describe('#promiseRatchet', function () {
  test('should timeout eventually', async () => {
    try {
      Logger.setLevel(LoggerLevelName.silly);
      const result: boolean | TimeoutToken = await PromiseRatchet.waitFor(fnFalse, true, 100, 2);
      Logger.info('Got : %s', result);
      expect(result).toEqual(false);
    } catch (err) {
      Logger.warn('Error: %s', err, err);
    }
  });

  test('should succeed on 3rd try', async () => {
    const promise: Promise<boolean> = PromiseRatchet.waitFor(fnOn3, true, 100, 4);
    const result: boolean | TimeoutToken = await promise;
    expect(result).toEqual(true);
  });

  test('should run 10 elements, 2 at a time', async () => {
    Logger.setLevel(LoggerLevelName.debug);
    const elements: any[][] = [
      [100, 'Test1'],
      [120, 'Test2'],
      [130, 'Test3'],
      [140, 'Test4'],
      [150, 'Test5'],
      [160, 'Test6'],
      [170, 'Test7'],
      [180, 'Test8'],
      [190, 'Test9'],
      [200, 'Test10'],
    ];

    const results: number[] = await PromiseRatchet.runBoundedParallel<number>(waitAndPrint, elements, this, 2);

    Logger.info('Final results %j', results);
    expect(results).toBeTruthy();
    expect(results.length).toEqual(10);
  }, 30000);

  test('should run 10 waits, 2 at a time', async () => {
    Logger.setLevel(LoggerLevelName.debug);
    const elements: number[] = [100, 110, 120, 130, 140, 150, 160, 170, 180, 200];

    const results: any[] = await PromiseRatchet.runBoundedParallelSingleParam(PromiseRatchet.wait, elements, this, 2);

    Logger.info('Final results %j', results);
    expect(results).toBeTruthy();
    expect(results.length).toEqual(10);
  });

  test.skip('should run an async function as a for/each', async () => {
    Logger.setLevel(LoggerLevelName.debug);
    const elements: number[] = [1001, 1002, 2000];
    const pfn: (v: any) => Promise<void> = async (v) => {
      Logger.info('Waiting %s', v);
      await PromiseRatchet.wait(v);
      Logger.info('Finished %s', v);
    };

    Logger.info('Serial test');
    await PromiseRatchet.asyncForEachSerial(elements, pfn);

    Logger.info('Parallel test');
    await PromiseRatchet.asyncForEachParallel(elements, pfn);

    Logger.info('Done');
  });
});
