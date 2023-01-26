/*
    Functions for working with booleans
*/

import { NumberRatchet } from './number-ratchet';

export class BooleanRatchet {
  public static allTrue(vals: boolean[], emptyArraysReturn: boolean = false): boolean {
    let rval: boolean = null;
    if (!!vals) {
      if (vals.length > 0) {
        rval = vals.reduce((a, i) => a && i, true);
      } else {
        rval = emptyArraysReturn;
      }
    } else {
      // Array was null
      rval = false;
    }
    return rval;
  }

  public static anyTrue(vals: boolean[], emptyArraysReturn: boolean = false): boolean {
    let rval: boolean = null;
    if (!!vals) {
      if (vals.length > 0) {
        rval = vals.reduce((a, i) => a || i, false);
      } else {
        rval = emptyArraysReturn;
      }
    } else {
      // Array was null
      rval = false;
    }
    return rval;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public static parseBool(val: any): boolean {
    return val === true || (val !== null && val !== undefined && typeof val === 'string' && val.toLowerCase() === 'true');
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public static intToBool(val: any): boolean {
    if (val === null || val === undefined) {
      return false;
    }
    return NumberRatchet.safeNumber(val) !== 0;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public static boolToInt(val: any): number {
    return BooleanRatchet.parseBool(val) ? 1 : 0;
  }
}
