/**
 * Some helpers to make it safe to have the node-only classes inside Ratchet
 */
import { ErrorRatchet } from './error-ratchet.js';
import { RequireRatchet } from './require-ratchet.js';
import { Logger } from '../logger/logger.js';

export class GlobalRatchet {
  // Prevent instantiation
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static fetchGlobalRecord(returnNullOnNone?: boolean): Record<string, any> {
    let rval: Record<string, any> = null;
    if (process?.env) {
      // Running in node
      Logger.silly('Using process.env as global');
      rval = process.env;
    } else if (global?.process?.env) {
      // Running poly-filled node
      Logger.silly('Using global.process.env as global');
      rval = global.process.env;
    } else if (global) {
      Logger.silly('Using process.env as global');
      rval = global;
    }
    if (!rval) {
      if (returnNullOnNone) {
        Logger.silly('Returning null as global');
        rval = null;
      } else {
        throw ErrorRatchet.fErr('Could not find process.env OR global in scope');
      }
    }
    return rval;
  }

  public static fetchGlobalVar(envVar: string): string {
    RequireRatchet.notNullOrUndefined(envVar, 'envVar');
    const myGlobal: Record<string, any> = GlobalRatchet.fetchGlobalRecord();
    const value: string = myGlobal[envVar];
    return value;
  }

  public static setGlobalVar(envVar: string, value: string): void {
    RequireRatchet.notNullOrUndefined(envVar, 'envVar');
    RequireRatchet.notNullOrUndefined(value, 'value');
    const myGlobal: Record<string, any> = GlobalRatchet.fetchGlobalRecord();
    myGlobal[envVar] = value;
  }
}
