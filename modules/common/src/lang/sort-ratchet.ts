/*
    Helper functions for working with sorting.

    Note that the functions in here do NOT claim to be able to correctly
    sort undefined in all cases, since certain browsers will auto
    sort undefined in arrays to certain places and never even
    call this function. To be safe, filter and convert yourself
    before sorting if undefined is a possibility

    See : https://stackoverflow.com/questions/4783242/javascript-array-sort-with-undefined-values
*/

import { RequireRatchet } from './require-ratchet.js';
import { NumberRatchet } from './number-ratchet.js';

export class SortRatchet {
  // Empty constructor prevents instantiation
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static sortNullToTop<T>(a: T, b: T, bothNonNullSort: (c: T, d: T) => number): number {
    return SortRatchet.nullSafeSort(a, b, true, bothNonNullSort);
  }

  public static sortNullToBottom<T>(a: T, b: T, bothNonNullSort: (c: T, d: T) => number): number {
    return SortRatchet.nullSafeSort(a, b, false, bothNonNullSort);
  }

  public static nullSafeSort<T>(a: T, b: T, nullsOnTop: boolean, bothNonNullSort: (c: T, d: T) => number): number {
    let rval: number;

    if (RequireRatchet.isNullOrUndefined(a) && RequireRatchet.isNullOrUndefined(b)) {
      rval = 0;
    } else if (RequireRatchet.isNullOrUndefined(a)) {
      rval = nullsOnTop ? -Infinity : Infinity;
    } else if (RequireRatchet.isNullOrUndefined(b)) {
      rval = nullsOnTop ? Infinity : -Infinity;
    } else {
      rval = bothNonNullSort(a, b);
    }

    return rval;
  }

  public static sortNumericStringsAsNumbers(a: string | number, b: string | number, sortNonNumbersToTop?: boolean): number {
    const an: number = NumberRatchet.safeNumber(a);
    const bn: number = NumberRatchet.safeNumber(b);
    return SortRatchet.nullSafeSort<number>(an, bn, sortNonNumbersToTop, (ax: number, bx: number) => ax - bx);
  }
}
