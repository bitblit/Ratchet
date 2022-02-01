import {PromiseRatchet} from './promise-ratchet';
import {Logger} from './logger';
import {TimeoutToken} from './timeout-token';

const fnFalse = (ignored) => {
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
  it('should timeout eventually', async () => {
    try {
      Logger.setLevelByName('silly');
      const result: boolean | TimeoutToken = await PromiseRatchet.waitFor(fnFalse, true, 100, 2);
      Logger.info('Got : %s', result);
      expect(result).toEqual(false);
    } catch (err) {
      Logger.warn('Error: %s', err, err);
    }
  });

  it('should succeed on 3rd try', async () => {
    const promise: Promise<boolean> = PromiseRatchet.waitFor(fnOn3, true, 100, 4);
    const result: boolean | TimeoutToken = await promise;
    expect(result).toEqual(true);
  });

  it('should run 10 elements, 2 at a time', async () => {
    Logger.setLevelByName('debug');
    const elements: any[][] = [
      [100, 'Test1'],
      [200, 'Test2'],
      [300, 'Test3'],
      [400, 'Test4'],
      [500, 'Test5'],
      [600, 'Test6'],
      [700, 'Test7'],
      [800, 'Test8'],
      [900, 'Test9'],
      [1000, 'Test10'],
    ];

    const results: number[] = await PromiseRatchet.runBoundedParallel<number>(waitAndPrint, elements, this, 2);

    Logger.info('Final results %j', results);
    expect(results).toBeTruthy();
    expect(results.length).toEqual(10);
  }, 30000);

  it('should run 10 waits, 2 at a time', async () => {
    Logger.setLevelByName('debug');
    const elements: number[] = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];

    const results: any[] = await PromiseRatchet.runBoundedParallelSingleParam(PromiseRatchet.wait, elements, this, 2);

    Logger.info('Final results %j', results);
    expect(results).toBeTruthy();
    expect(results.length).toEqual(10);
  });

  xit('should run an async function as a for/each', async () => {
    Logger.setLevelByName('debug');
    const elements: number[] = [1001, 1002, 2000];
    const pfn: Function = async (v) => {
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
