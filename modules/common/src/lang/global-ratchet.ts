/**
 * Some helpers to make it safe to have the node-only classes inside Ratchet
 *
 * Since lots of other ratchets use global for safe singletons, we dont
 * depend on anything in here (Especially logger)
 */
import { ErrorRatchet } from './error-ratchet.js';
import { RequireRatchet } from './require-ratchet.js';

export class GlobalRatchet {
  // Prevent instantiation
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  // Fetches the global scope objects (string-> object)
  public static fetchGlobalVarsRecord(returnNullOnNone?: boolean): Record<string, any> {
    let rval: Record<string, any> = null;
    if (global) {
      rval = global;
    } else if (window) {
      // In the browser
      rval = window;
    } else if (process) {
      rval = process; // Final failover,  not really a great option
    }
    if (!rval) {
      if (returnNullOnNone) {
        rval = null;
      } else {
        throw ErrorRatchet.fErr('Could not find global, process, or window in scope');
      }
    }
    return rval;
  }

  public static fetchGlobalVar<T>(key: string, defValue?: T): T {
    const rec: Record<string, any> = GlobalRatchet.fetchGlobalVarsRecord(false);
    let rval: T = rec[key];
    if (!rval && defValue) {
      rec[key] = defValue;
      rval = defValue;
    }
    return rval;
  }

  public static setGlobalVar(key: string, val: any): void {
    const rec: Record<string, any> = GlobalRatchet.fetchGlobalVarsRecord(false);
    rec[key] = val;
  }

  // This is meant to handle faking env vars (basically string-> string) in the context of a browser, polyfills, etc
  public static fetchGlobalEnvVarRecord(returnNullOnNone?: boolean): Record<string, any> {
    let rval: Record<string, any> = null;
    if (process?.env) {
      // Running in node
      rval = process.env;
    } else if (global?.process?.env) {
      // Running poly-filled node
      rval = global.process.env;
    } else if (global) {
      rval = global;
    } else if (window) {
      // In the browser
      rval = window;
    }
    if (!rval) {
      if (returnNullOnNone) {
        rval = null;
      } else {
        throw ErrorRatchet.fErr('Could not find process.env OR global OR window in scope');
      }
    }
    return rval;
  }

  public static fetchGlobalEnvVar(envVar: string): string {
    RequireRatchet.notNullOrUndefined(envVar, 'envVar');
    const myGlobal: Record<string, any> = GlobalRatchet.fetchGlobalEnvVarRecord();
    const value: any = myGlobal[envVar];
    const sValue: string = value ? String(value) : value;
    return sValue;
  }

  public static setGlobalEnvVar(envVar: string, value: string): void {
    RequireRatchet.notNullOrUndefined(envVar, 'envVar');
    RequireRatchet.notNullOrUndefined(value, 'value');
    const myGlobal: Record<string, any> = GlobalRatchet.fetchGlobalEnvVarRecord();
    myGlobal[envVar] = value;
  }
}
