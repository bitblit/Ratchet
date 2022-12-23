/*
    Functions for making simple assertions
*/

import { ErrorRatchet } from './error-ratchet';

export class RequireRatchet {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public static isNullOrUndefined(ob: any): boolean {
    return ob === null || ob === undefined;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public static notNullOrUndefined(ob: any, name = 'object'): void {
    if (RequireRatchet.isNullOrUndefined(ob)) {
      throw new Error(name + ' may not be null or undefined');
    }
  }

  public static notNullUndefinedOrOnlyWhitespaceString(ob: string, name: string = 'string'): void {
    if (RequireRatchet.isNullOrUndefined(ob) || ob.trim() === '') {
      throw new Error(name + ' may not be null or undefined or only whitespace string');
    }
  }

  public static notNullUndefinedOrEmptyArray(ob: any[], name: string = 'string'): void {
    if (RequireRatchet.isNullOrUndefined(ob) || ob.length === 0) {
      throw new Error(name + ' may not be null or undefined or an empty array');
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public static equal(ob1: any, ob2: any, message = 'Values must be equal'): void {
    if (ob1 !== ob2) {
      throw new Error(message);
    }
  }

  public static true(ob: boolean, message = 'Value must be true'): void {
    RequireRatchet.equal(ob, true, message);
  }

  public static noNullOrUndefinedValuesInArray(arr: any[], expectedLength: number = null, customMsg: string = null): void {
    RequireRatchet.notNullOrUndefined(arr, 'Source array may not be null');
    if (expectedLength !== null && arr.length !== expectedLength) {
      ErrorRatchet.throwFormattedErr('Expected array of length %d but was %d %s', expectedLength, arr.length, customMsg);
    }
    for (let i = 0; i < arr.length; i++) {
      if (RequireRatchet.isNullOrUndefined(arr[i])) {
        ErrorRatchet.throwFormattedErr('Array index %d was null or undefined %s', i, customMsg);
      }
    }
  }

  public static noNullOrUndefinedValuesInRestArgs(expectedLength: number, ...restArgs: any[]): void {
    RequireRatchet.notNullOrUndefined(restArgs, 'Source array may not be null');
    if (expectedLength !== null && restArgs.length !== expectedLength) {
      ErrorRatchet.throwFormattedErr('Expected array of length %d but was %d', expectedLength, restArgs.length);
    }
    for (let i = 0; i < restArgs.length; i++) {
      if (RequireRatchet.isNullOrUndefined(restArgs[i])) {
        ErrorRatchet.throwFormattedErr('Array index %d was null or undefined', i);
      }
    }
  }

  public static constructorArgumentsMatchLengthAndAreNonNull(): void {
    // eslint-disable-next-line prefer-rest-params
    const args: any[] = Array.from(arguments);
    const len: number = this.constructor.length;
    return RequireRatchet.noNullOrUndefinedValuesInArray(args, len);
  }
}
