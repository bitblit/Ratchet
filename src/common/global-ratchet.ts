/**
 * Some helpers to make it safe to have the node-only classes inside Ratchet
 */
import { ErrorRatchet } from './error-ratchet';
import { RequireRatchet } from './require-ratchet';

export class GlobalRatchet {
  // Empty constructor prevents instantiation
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static fetchGlobalRecord(returnNullOnNone?: boolean, dumpLocation?: boolean): Record<string, any> {
    let rval: Record<string, any> = null;
    if (!!process) {
      // Running in node
      rval = process;
      if (dumpLocation) {
        console.trace('Using process as global');
      }
    } else if (!!global?.process) {
      // Running poly-filled node
      if (dumpLocation) {
        console.trace('Using global.process as global');
      }
      rval = global.process;
    } else if (global) {
      if (dumpLocation) {
        console.trace('Using global as global');
      }
      rval = global;
    } else if (!!window) {
      if (dumpLocation) {
        console.trace('Using window as global');
      }
      rval = window;
    }
    if (!rval) {
      if (returnNullOnNone) {
        if (dumpLocation) {
          console.trace('Returning null as global');
        }
        rval = null;
      } else {
        throw ErrorRatchet.fErr('Could not find any of process, global.process, global, or window in scope');
      }
    }
    return rval;
  }

  public static fetchGlobalVar<T>(envVar: string): T {
    RequireRatchet.notNullOrUndefined(envVar, 'envVar');
    const myGlobal: Record<string, any> = GlobalRatchet.fetchGlobalRecord();
    const value: T = myGlobal[envVar];
    return value;
  }

  public static setGlobalVar(envVar: string, value: any): void {
    RequireRatchet.notNullOrUndefined(envVar, 'envVar');
    RequireRatchet.notNullOrUndefined(value, 'value');
    const myGlobal: Record<string, any> = GlobalRatchet.fetchGlobalRecord();
    myGlobal[envVar] = value;
  }
}
