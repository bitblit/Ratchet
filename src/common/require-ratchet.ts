/*
    Functions for making simple assertions
*/

import { ErrorRatchet } from './error-ratchet';

export class RequireRatchet {
  public static notNullOrUndefined(ob: any, name = 'object'): void {
    if (ob === null || ob === undefined) {
      throw new Error(name + ' may not be null or undefined');
    }
  }

  public static equal(ob1: any, ob2: any, message = 'Values must be equal'): void {
    if (ob1 !== ob2) {
      throw new Error(message);
    }
  }

  public static true(ob: boolean, message = 'Value must be true'): void {
    RequireRatchet.equal(ob, true, message);
  }

  public static noNullOrUndefinedValuesInArray(arr: any[], expectedLength: number = null): void {
    RequireRatchet.notNullOrUndefined(arr, 'Source array may not be null');
    if (expectedLength !== null && arr.length !== expectedLength) {
      ErrorRatchet.throwFormattedErr('Expected array of length %d but was %d', expectedLength, arr.length);
    }
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === null || arr[i] === undefined) {
        ErrorRatchet.throwFormattedErr('Array index %d was null or undefined', i);
      }
    }
  }
}
