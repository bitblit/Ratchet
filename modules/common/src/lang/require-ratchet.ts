/*
    Functions for making simple assertions
*/

export class RequireRatchet {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public static isNullOrUndefined(ob: any): boolean {
    return Object.is(ob, null) || Object.is(ob, undefined);
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
      throw new Error(`Expected array of length ${expectedLength} but was ${arr.length} ${customMsg}`);
    }
    for (let i = 0; i < arr.length; i++) {
      if (RequireRatchet.isNullOrUndefined(arr[i])) {
        throw new Error(`Array index ${i} was null or undefined ${customMsg}`);
      }
    }
  }

  public static noNullOrUndefinedValuesInRestArgs(expectedLength: number, ...restArgs: any[]): void {
    RequireRatchet.notNullOrUndefined(restArgs, 'Source array may not be null');
    if (expectedLength !== null && restArgs.length !== expectedLength) {
      throw new Error(`Expected array of length ${expectedLength} but was ${restArgs.length}`);
    }
    for (let i = 0; i < restArgs.length; i++) {
      if (RequireRatchet.isNullOrUndefined(restArgs[i])) {
        throw new Error(`Array index ${i} was null or undefined`);
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
