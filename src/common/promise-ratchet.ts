/*
    Functions for working with promises
*/

import {Logger} from './logger';
import {ArrayRatchet} from './array-ratchet';

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
    public static resolveOnEvent<T>(evtSrc: any, okEvtNames: string[], errEvtNames: string[] = [], rval: T = null): Promise<T> {
        if (!evtSrc || !okEvtNames || okEvtNames.length === 0 || !evtSrc['on']) {
            Promise.reject('Cannot continue - missing source object or name, or the object is not an event source');
        }

        return new Promise<T>((res,rej)=>{
            okEvtNames.forEach(e=>{
                evtSrc.on(e, ()=>{res(rval)});
            });

            if (!!errEvtNames) {
                errEvtNames.forEach(e=>{
                    evtSrc.on(e, ()=>{rej(e)});
                });
            }
        });
    }

    public static timeout<T>(srcPromise: Promise<T>, title: string, timeoutMS: number, resolveAsNull: boolean): Promise<T> {
        return Promise.race([
            srcPromise,
            PromiseRatchet.createTimeoutPromise(title, timeoutMS, resolveAsNull) as Promise<T>
        ]);
    }

    public static createTimeoutPromise<T>(title: string, timeoutMS: number, resolveAsNull: boolean, logAsWarning: boolean = false): Promise<T> {
        // Create a promise that rejects in <timeoutMS> milliseconds
        return new Promise<T>((resolve, reject) => {
            let id = setTimeout(() => {
                clearTimeout(id);
                if (logAsWarning) {
                    Logger.warn('Timed out after %d ms waiting for results of %s', timeoutMS, title);
                }
                else {
                    Logger.silly('Timed out after %d ms waiting for results of %s', timeoutMS, title);
                }
                if (resolveAsNull) {
                    resolve(null);
                }
                else {
                    reject('Timeout after '+timeoutMS+' ms');
                }
            }, timeoutMS)
        });
    }

    public static async wait(time: number): Promise<void> {
        await PromiseRatchet.createTimeoutPromise('Wait '+time, time, true, false);
    }

    public static dumpResult(result, autoDebug: boolean = false): void {
        Logger.info('Success, result was : \n\n%s\n\n', JSON.stringify(result));
        if (autoDebug) {
            debugger; // After log so we already have the output
        }
        process.exit(0);
    }

    public static dumpError(err, autoDebug: boolean = false): void {
        Logger.warn('Failure, err was : \n\n%s\n\n  --  \n\n%s\n\n', JSON.stringify(err), String(err));
        console.trace();
        if (autoDebug) {
            debugger; // After log so we already have the output
        }
        process.exit(1);
    }


    public static logErrorAndReturnNull(err, autoDebug: boolean = false): void {
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
    public static waitFor(testFunction: (n: number) => any, expectedValue: any, intervalMS: number, maxCycles: number, label: string = 'waitFor', count: number = 0): Promise<boolean> {
        if (expectedValue == null || intervalMS < 50 || maxCycles < 1 || count < 0 || typeof testFunction != 'function') {
            Logger.warn('%s: Invalid configuration for waitFor - exiting immediately', label);

            Logger.warn('ExpectedValue : %s ; interval: %d ; maxCycles: %d ; test : %s', expectedValue, intervalMS, maxCycles, (typeof testFunction))

            return Promise.resolve(false);
        }

        let curVal: any = null;
        try {
            curVal = testFunction(count);
        }
        catch (err) {
            Logger.warn('%s: Caught error while waiting, giving up', label);
            return Promise.resolve(false);
        }

        if (curVal == null) {
            Logger.debug('%s:CurVal was null - aborting', label);
            return Promise.resolve(false);
        }
        else if (curVal == expectedValue) {
            Logger.debug('%s:Found expected value', label);
            return Promise.resolve(true);
        }
        else if (count > maxCycles) // Exceeded max cycles
        {
            Logger.debug('%s:Exceeded max cycles, giving up', label);
            return Promise.resolve(false);
        }
        else {
            Logger.debug('%s : value not reached yet, waiting (count = %d of %d)', label, count, maxCycles);
            return PromiseRatchet.createTimeoutPromise('WaitFor', intervalMS, true).then(ignored => {
                return PromiseRatchet.waitFor(testFunction, expectedValue, intervalMS, maxCycles, label, count + 1);
            });
        }
    }

    public static async runBoundedParallel<T>(promiseFn: Function, params: any[][], context: any, maxConcurrent: number = 1): Promise<T[]> {
        let rval: T[] = [];
        let remain: any[][] = params;
        Logger.debug('Processing %d total elements %d at a time', params.length, maxConcurrent);

        const ctx:any = context || this;
        while (remain.length>0) {
            let curBatch: any[] = remain.slice(0, Math.min(remain.length, maxConcurrent));
            remain = remain.slice(curBatch.length);

            const proms: Promise<T>[] = curBatch.map(c => promiseFn.apply(ctx,c) as Promise<T>);
            const output: T[] = await Promise.all(proms);
            rval = rval.concat(output);
            Logger.debug('%d elements remain', remain.length);
        }
        return rval;
    }


    public static async runBoundedParallelSingleParam<T>(promiseFn: Function, params: any[], context: any, maxConcurrent: number = 1): Promise<T[]> {
        const wrappedParams: any[][]=ArrayRatchet.wrapElementsInArray(params);
        return PromiseRatchet.runBoundedParallel<T>(promiseFn, wrappedParams, context, maxConcurrent);
    }

    private constructor() {}

}
