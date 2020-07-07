/*
    Functions for working with errors
*/

import { Logger } from './logger';
import * as util from 'util';

export class ErrorRatchet {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public static safeStringifyErr(err: any, log = true): string {
    let rval = 'ERR WAS NULL';
    if (err) {
      try {
        rval = JSON.stringify(err);
      } catch (err2) {
        rval = err.message || String(err);
      }
    }
    if (log) {
      Logger.error('%s', rval, err);
    }
    return rval;
  }

  public static fErr(format: string, ...input: any[]): Error {
    const msg: string = util.format(format, ...input);
    return new Error(msg);
  }

  public static throwFormattedErr(format: string, ...input: any[]): Error {
    throw ErrorRatchet.fErr(format, ...input);
  }
}
