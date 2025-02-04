/*
    Functions for working with errors
*/

import { Logger } from '../logger/logger.js';
import { StringRatchet } from './string-ratchet.js';
import { ErrorHandlingApproach } from './error-handling-approach.js';
import { LoggerLevelName } from '../logger/logger-level-name.js';

export class ErrorRatchet {
  public static handleErrorByApproach(
    err: any,
    approach: ErrorHandlingApproach,
    level: LoggerLevelName = LoggerLevelName.error,
    formatMsg: string = 'Error: %s',
  ) {
    if (err && approach) {
      if (approach === ErrorHandlingApproach.LogAndSwallow || approach === ErrorHandlingApproach.LogAndPassThru) {
        Logger.logByLevel(level, formatMsg, err, err);
      }
      if (approach === ErrorHandlingApproach.PassThru || approach === ErrorHandlingApproach.LogAndPassThru) {
        throw err;
      }
    } else {
      Logger.error('Cannot handle error %s - %s, missing either error or approach', err, approach);
    }
  }

  public static safeStringifyErr(err: any, log = true): string {
    let rval = 'ERR WAS NULL';
    if (err) {
      if (err['message']) {
        rval = err['message'];
      } else {
        try {
          rval = JSON.stringify(err);
        } catch (err2) {
          Logger.error('Failed to json stringify: %s', err2);
          rval = String(err);
        }
      }
    }
    if (log) {
      Logger.error('%s', rval, err);
    }
    return rval;
  }

  // Mainly for Typescript 4.5+ where this is now any/unknown by default
  public static asErr(input: any): Error {
    let rval: Error = null;
    if (input) {
      if (input instanceof Error) {
        rval = input;
      } else {
        rval = new Error('Force-Cast to error : ' + String(input));
      }
    }
    return rval;
  }

  public static fErr(format: string, ...input: any[]): Error {
    const msg: string = StringRatchet.format(format, ...input);
    return new Error(msg);
  }

  public static throwFormattedErr(format: string, ...input: any[]): Error {
    throw ErrorRatchet.fErr(format, ...input);
  }
}
