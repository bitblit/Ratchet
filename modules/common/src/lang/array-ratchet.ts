/*
    Functions for working with arrays
*/

import { RequireRatchet } from './require-ratchet.js';
import { MapRatchet } from './map-ratchet.js';

export class ArrayRatchet {
  public static wrapElementsInArray(input: any[]): any[][] {
    return input.map((i) => [i]);
  }

  public static compareTwoArrays<T>(ar1: T[], ar2: T[], fn: ComparisonFunction<T>): MatchReport<T> {
    ar1.sort(fn);
    ar2.sort(fn);

    let id1 = 0;
    let id2 = 0;
    const rval: MatchReport<T> = {
      matching: [],
      setOneOnly: [],
      setTwoOnly: [],
    };

    while (id1 < ar1.length && id2 < ar2.length) {
      const aVal: T = ar1[id1];
      const pVal: T = ar2[id2];
      const comp: number = fn(aVal, pVal);

      if (comp === 0) {
        rval.matching.push(aVal);
        id1++;
        id2++;
      } else if (comp < 0) {
        rval.setOneOnly.push(aVal);
        id1++;
      } else {
        rval.setTwoOnly.push(pVal);
        id2++;
      }
    }

    if (id1 < ar1.length - 1) {
      rval.setOneOnly = rval.setOneOnly.concat(ar1.slice(id1));
    }
    if (id2 < ar2.length - 1) {
      rval.setTwoOnly = rval.setTwoOnly.concat(ar2.slice(id2));
    }

    return rval;
  }

  /**
   * Given a sorted array of type T with a field named fieldName of type R, perform
   * binary search to find the top and bottom bounds and extract the result
   * @param input Array to select from
   * @param fieldDotPath Path of the field
   * @param minInclusive min value of field to include
   * @param maxExclusive max value of field to include
   */
  public static extractSubarrayFromSortedByNumberField<T>(
    input: T[],
    fieldDotPath: string,
    minInclusive: number,
    maxExclusive: number,
  ): T[] {
    if (!input || input.length === 0) {
      return input;
    }

    let bottomIdx: number = minInclusive === null ? 0 : ArrayRatchet.findSplit(input, fieldDotPath, minInclusive) || 0;
    const topIdx: number = maxExclusive === null ? input.length : ArrayRatchet.findSplit(input, fieldDotPath, maxExclusive);

    const bottomValue: number = MapRatchet.findValueDotPath(input[bottomIdx], fieldDotPath);
    if (bottomIdx === input.length - 1 && bottomValue < minInclusive) {
      // Highest value is still larger than min
      return [];
    }

    // For min inclusive, have to handle this case
    // Since it has to be able to handle the value===min case
    if (bottomIdx < input.length && bottomIdx < topIdx && bottomValue < minInclusive) {
      bottomIdx++;
    }

    return input.slice(bottomIdx, topIdx + 1);
  }

  /**
   * Given a sorted array, find the location in the array where all the entries
   * above that index have a value larger that the target (the index and under
   * are less than or equal to the target)
   * @param input Array to select from
   * @param fieldName Name of the field
   * @param target the value to search for
   */
  public static findSplit(input: any[], fieldDotPath: string, target: number): number {
    RequireRatchet.notNullOrUndefined(input);
    RequireRatchet.notNullOrUndefined(fieldDotPath);
    RequireRatchet.notNullOrUndefined(target);

    if (input.length === 0 || MapRatchet.findValueDotPath(input[0], fieldDotPath) > target) {
      return null;
    }

    let min = 0;
    let max: number = input.length;
    let rval: number = null;

    while (rval === null) {
      const curIdx: number = Math.floor((min + max) / 2);
      const curVal: number = MapRatchet.findValueDotPath(input[curIdx], fieldDotPath);
      if (min === max || min === max - 1) {
        rval = min;
      } else if (curVal <= target) {
        min = curIdx;
      } else {
        max = curIdx;
      }
    }
    return rval;
  }

  public static shuffleInPlace(array: any[]): void {
    if (array?.length) {
      // Ignore nulls and non-arrays
      for (let i = array.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }
  }
}

export type ComparisonFunction<T> = (t1: T, t2: T) => number;

export interface MatchReport<T> {
  matching: T[];
  setOneOnly: T[];
  setTwoOnly: T[];
}
