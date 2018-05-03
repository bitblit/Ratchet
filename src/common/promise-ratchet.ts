
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

    public static createTimeoutPromise<T>(title: string, timeoutMS : number, resolveAsNull: boolean) : Promise<T> {
        // Create a promise that rejects in <timeoutMS> milliseconds
        return new Promise<T>((resolve, reject) => {
            let id = setTimeout(() => {
                clearTimeout(id);
                Logger.warn("Timed out after %d ms waiting for results of %s", timeoutMS, title);
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

}
