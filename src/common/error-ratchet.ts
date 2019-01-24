/*
    Functions for working with errors
*/

import {Logger} from './logger';

export class ErrorRatchet {

    public static safeStringifyErr(err: any, log: boolean = true): string {
        let rval: string = 'ERR WAS NULL';
        if (err) {
            try {
                rval = JSON.stringify(err);
            }
            catch (err2) {
                rval = err.message || String(err);
            }
        }
        if (log) {
            Logger.error('%s',rval,err);
        }
        return rval;
    }

}
