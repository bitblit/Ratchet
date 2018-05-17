
/*
    Functions for working with promises
*/

import {Logger} from "./logger";

export class PromiseRatchet {

    public static timeout<T>(srcPromise: Promise<T>,title: string, timeoutMS : number, resolveAsNull: boolean ) : Promise<T> {
        return Promise.race([
            srcPromise,
            PromiseRatchet.createTimeoutPromise(title, timeoutMS, resolveAsNull) as Promise<T>
        ]);
    }

    public static createTimeoutPromise<T>(title: string, timeoutMS : number, resolveAsNull: boolean, logAsWarning: boolean = false) : Promise<T> {
        // Create a promise that rejects in <timeoutMS> milliseconds
        return new Promise<T>((resolve, reject) => {
            let id = setTimeout(() => {
                clearTimeout(id);
                if (logAsWarning)
                {
                    Logger.warn("Timed out after %d ms waiting for results of %s", timeoutMS, title);
                }
                else {
                    Logger.silly("Timed out after %d ms waiting for results of %s", timeoutMS, title);
                }
                if (resolveAsNull)
                {
                    resolve(null);
                }
                else
                {
                    reject("Timeout");
                }
            }, timeoutMS)
        });
    }


    public static dumpResult(result) : void
    {
        debugger;
        Logger.info("Success, result was : \n\n%s\n\n",JSON.stringify(result));
        process.exit(0);
    }

    public static dumpError(err) : void
    {
        debugger;
        Logger.warn("Failure, err was : \n\n%s\n\n  --  \n\n%s\n\n",JSON.stringify(err),String(err));
        console.trace();
        process.exit(1);
    }


    public static logErrorAndReturnNull(err) : void
    {
        debugger;
        Logger.warn("Failure, err was : \n\n%s\n\n  --  \n\n%s\n\n",JSON.stringify(err),String(err));
        return null;
    }

    public static runPromiseAndDump<T>(promise: Promise<T>) : void
    {
        promise.then(PromiseRatchet.dumpResult).catch(PromiseRatchet.dumpError);
    }

    // Waits for up to maxCycles iterations of intervalMS milliseconds for the test function to return the expected value
    // If that happens, returns true, otherwise, returns false
    // Also returns false if the test function throws an exception or returns null (null may NOT be the expectedValue, as
    // it is used as the "breakout" poison pill value
    public static waitFor(testFunction:(n:number)=>any, expectedValue:any, intervalMS: number, maxCycles:number, label:string='waitFor', count:number = 0) : Promise<boolean>
    {
        if (expectedValue==null || intervalMS<50 || maxCycles<1 || count<0 || typeof test != 'function') {
            Logger.warn("%s: Invalid configuration for waitFor - exiting immediately",label);
        }
        let curVal :any = null;
        try {
            curVal = testFunction(count);
        }
        catch (err) {
            Logger.warn("%s: Caught error while waiting, giving up",label);
            return Promise.resolve(false);
        }

        if (curVal==null) {
            Logger.debug("%s:CurVal was null - aborting",label);
            return Promise.resolve(false);
        }
        else if (curVal==expectedValue)
        {
            Logger.debug("%s:Found expected value",label);
            return Promise.resolve(true);
        }
        else if (count>maxCycles) // Exceeded max cycles
        {
            Logger.debug("%s:Exceeded max cycles, giving up",label);
            return Promise.resolve(false);
        }
        else
        {
            Logger.debug("%s : value not reached yet, waiting (count = %d of %d)",label,count,maxCycles);
            return PromiseRatchet.createTimeoutPromise("WaitFor",intervalMS,true).then(ignored=>{
                return PromiseRatchet.waitFor(testFunction, expectedValue, intervalMS, maxCycles, label, count+1);
            });
        }
    }

}
