/*
    Functions for working with promises
*/

import { Logger } from './logger';
import { ArrayRatchet } from './array-ratchet';
import { TimeoutToken } from './timeout-token';
import { StopWatch } from './stop-watch';
import { LoggerLevelName } from './logger-support/logger-level-name';

export class PromiseRatchet {
  /**
   * Returns a promise that only resolves when the named event happens on the event source -
   * the promise will return the passed object, if any, at that point.  If errEventNames are specified,
   * the promise will reject when any of those events are fired
   * @param evtSrc Object that will fire the event
   * @param okEvtNames Names of the event that will be considered successes
   * @param errEventNames Names of error events
   * @param rval Return value, if any
   */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public static resolveOnEvent<T>(evtSrc: any, okEvtNames: string[], errEvtNames: string[] = [], rval: T = null): Promise<T> {
    if (!evtSrc || !okEvtNames || okEvtNames.length === 0 || !evtSrc['on']) {
      Promise.reject('Cannot continue - missing source object or name, or the object is not an event source');
    }

    return new Promise<T>((res, rej) => {
      okEvtNames.forEach((e) => {
        evtSrc.on(e, () => {
          res(rval);
        });
      });

      if (!!errEvtNames) {
        errEvtNames.forEach((e) => {
          evtSrc.on(e, (err) => {
            rej(err);
          });
        });
      }
    });
  }

  public static timeout<T>(srcPromise: Promise<T>, title: string, timeoutMS: number): Promise<T | TimeoutToken> {
    return Promise.race([srcPromise, PromiseRatchet.createTimeoutPromise(title, timeoutMS) as Promise<T | TimeoutToken>]);
  }

  public static createTimeoutPromise(title: string, timeoutMS: number): Promise<TimeoutToken> {
    // Create a promise that rejects in <timeoutMS> milliseconds
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return new Promise<TimeoutToken>((resolve, reject) => {
      const id = setTimeout(() => {
        clearTimeout(id);
        const rval: TimeoutToken = new TimeoutToken(title, timeoutMS);
        resolve(rval);
      }, timeoutMS);
    });
  }

  public static async wait(time: number): Promise<void> {
    // Ignore the returned timeout token
    await PromiseRatchet.createTimeoutPromise('Wait ' + time, time);
    Logger.silly('Finished wait of %d ms', time);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public static dumpResult(result: any, autoDebug = false): void {
    Logger.info('Success, result was : \n\n%s\n\n', JSON.stringify(result));
    if (autoDebug) {
      debugger; // After log so we already have the output
    }
    process.exit(0);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public static dumpError(err: any, autoDebug = false): void {
    Logger.warn('Failure, err was : \n\n%s\n\n  --  \n\n%s\n\n', JSON.stringify(err), String(err));
    console.trace();
    if (autoDebug) {
      debugger; // After log so we already have the output
    }
    process.exit(1);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public static logErrorAndReturnNull(err: any, autoDebug = false): void {
    Logger.warn('Failure, err was : \n\n%s\n\n  --  \n\n%s\n\n', JSON.stringify(err), String(err));
    if (autoDebug) {
      debugger; // After log so we already have the output
    }
    return null;
  }

  public static runPromiseAndDump<T>(promise: Promise<T>): void {
    promise.then(PromiseRatchet.dumpResult).catch(PromiseRatchet.dumpError);
  }

  // Waits for up to maxCycles iterations of intervalMS milliseconds for the test function to return the expected value
  // If that happens, returns true, otherwise, returns false
  // Also returns false if the test function throws an exception or returns null (null may NOT be the expectedValue, as
  // it is used as the "breakout" poison pill value
  public static async waitFor(
    testFunction: (n: number) => any,
    expectedValue: any, // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
    intervalMS: number,
    maxCycles: number,
    label = 'waitFor',
    count = 0
  ): Promise<boolean> {
    if (expectedValue == null || intervalMS < 50 || maxCycles < 1 || count < 0 || typeof testFunction != 'function') {
      Logger.warn('%s: Invalid configuration for waitFor - exiting immediately', label);

      Logger.warn(
        'ExpectedValue : %s ; interval: %d ; maxCycles: %d ; test : %s',
        expectedValue,
        intervalMS,
        maxCycles,
        typeof testFunction
      );

      return false;
    }

    let curVal: any = null;
    try {
      curVal = testFunction(count);
    } catch (err) {
      Logger.warn('%s: Caught error while waiting, giving up', label);
      return false;
    }

    if (curVal === null) {
      Logger.debug('%s:CurVal was null - aborting', label);
      return false;
    } else if (curVal == expectedValue) {
      Logger.debug('%s:Found expected value', label);
      return true;
    } else if (count > maxCycles) {
      // Exceeded max cycles
      Logger.debug('%s:Exceeded max cycles, giving up', label);
      return false;
    } else {
      Logger.debug('%s : value not reached yet, waiting (count = %d of %d)', label, count, maxCycles);
      await PromiseRatchet.wait(intervalMS);
      return PromiseRatchet.waitFor(testFunction, expectedValue, intervalMS, maxCycles, label, count + 1);
    }
  }

  public static async runBoundedParallel<T>(
    promiseFn: Function, // eslint-disable-line @typescript-eslint/ban-types
    params: any[][],
    context: any, // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
    maxConcurrent = 1,
    logLevel = LoggerLevelName.debug
  ): Promise<T[]> {
    const sw: StopWatch = new StopWatch();
    sw.start();
    let rval: T[] = [];
    let remain: any[][] = params;
    Logger.logByLevel(logLevel, 'Processing %d total elements %d at a time', params.length, maxConcurrent);

    const ctx: any = context || this;
    let processed = 0;
    const totalCount: number = remain.length;

    while (remain.length > 0) {
      const curBatch: any[] = remain.slice(0, Math.min(remain.length, maxConcurrent));
      remain = remain.slice(curBatch.length);

      const proms: Promise<T>[] = curBatch.map((c) => promiseFn.apply(ctx, c) as Promise<T>);
      const output: T[] = await Promise.all(proms);
      processed += proms.length;
      rval = rval.concat(output);

      const pct: number = processed / totalCount;
      Logger.logByLevel(logLevel, '%d elements remain : %s', remain.length, sw.dumpExpected(pct));
    }
    return rval;
  }

  public static async runBoundedParallelSingleParam<T>(
    promiseFn: Function, // eslint-disable-line @typescript-eslint/ban-types
    params: any[],
    context: any, // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
    maxConcurrent = 1,
    logLevel = LoggerLevelName.debug
  ): Promise<T[]> {
    const wrappedParams: any[][] = ArrayRatchet.wrapElementsInArray(params);
    return PromiseRatchet.runBoundedParallel<T>(promiseFn, wrappedParams, context, maxConcurrent, logLevel);
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  public static async asyncForEachSerial(array: any[], callback: Function): Promise<void> {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  public static async asyncForEachParallel(array: any[], callback: Function): Promise<void> {
    const proms: Promise<any>[] = [];

    for (let index = 0; index < array.length; index++) {
      proms.push(callback(array[index], index, array));
    }
    await Promise.all(proms);
  }

  private constructor() {
    // Blocked for instantiation
  }
}
