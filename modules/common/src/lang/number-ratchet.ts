/*
    Functions for working with numbers
*/

import { Logger } from '../logger/logger.js';
import { RequireRatchet } from './require-ratchet.js';

export class NumberRatchet {
  private static MAX_LEADING_ZEROS_FORMAT_LENGTH = 1000; // Because really, why?
  public static readonly DEFAULT_SAFE_NUMBER_OPTIONS: SafeNumberOptions = {
    ifNotNumber: null,
    returnValueForNull: null,
    returnValueForUndefined: null,
    preParseCharacterMapping: { ',': '' },
  };

  public static toFixedDecimalNumber(input: number | string, placesAfterPoint: number): number {
    const v: number = NumberRatchet.safeNumber(input);
    // If v is not defined, let that bubble up...
    return v === null || v === undefined ? v : NumberRatchet.safeNumber(v.toFixed(placesAfterPoint));
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public static leadingZeros(val: any, size: number): string {
    const sVal = String(val);
    if (sVal.length < size) {
      let pad = '0000';
      if (size > NumberRatchet.MAX_LEADING_ZEROS_FORMAT_LENGTH) {
        throw 'Cannot format number that large (max length is ' + NumberRatchet.MAX_LEADING_ZEROS_FORMAT_LENGTH + ')';
      }
      while (pad.length < size) {
        pad = pad + pad; // It won't take that long to get there
      }

      return (pad + sVal).slice(-1 * size);
    } else {
      return sVal;
    }
  }

  public static between(inTest: number, inP1: number, inP2: number): boolean {
    const test: number = NumberRatchet.safeNumber(inTest);
    const p1: number = NumberRatchet.safeNumber(inP1);
    const p2: number = NumberRatchet.safeNumber(inP2);

    return (test >= p1 && test <= p2) || (test >= p2 && test <= p1);
  }

  // If it's a number, leave it alone, if it's a string, parse it.
  // If its null or undefined, default to passing it through
  // unmodified to match old behavior, but if the user sets the
  // useDefaultForNullAndUndefined flag, use it instead
  // I support both modes because some people consider "null/undefined" a valid value for
  // numbers and others don't!
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public static safeNumber(input: any, ifNotNumber: number = null, useDefaultForNullAndUndefined?: boolean): number {
    const opts: Partial<SafeNumberOptions> = {
      ifNotNumber: ifNotNumber,
      returnValueForNull: useDefaultForNullAndUndefined ? ifNotNumber : null,
      returnValueForUndefined: useDefaultForNullAndUndefined ? ifNotNumber : undefined,
    };
    if (useDefaultForNullAndUndefined === undefined) {
      opts.returnValueForUndefined = null; // For backwards compatibility - used to return null for both null and undefined
    }

    return NumberRatchet.safeNumberOpt(input, opts);
  }

  public static safeNumberOpt(input: any, optionPart?: Partial<SafeNumberOptions>): number {
    let rval: number = undefined;
    const opts: SafeNumberOptions = Object.assign({}, NumberRatchet.DEFAULT_SAFE_NUMBER_OPTIONS, optionPart || {});
    if (input === null) {
      rval = opts.returnValueForNull;
    } else if (input === undefined) {
      rval = opts.returnValueForUndefined;
    } else {
      const type: string = typeof input;
      if (type == 'number') {
        rval = input;
      } else if (type == 'string') {
        let test: string = input.trim();
        if (test.length === 0) {
          rval = opts.ifNotNumber;
        } else {
          if (opts.preParseCharacterMapping && Object.keys(opts.preParseCharacterMapping).length > 0) {
            let t2: string = '';
            for (let i = 0; i < test.length; i++) {
              const cr: string = test.charAt(i);
              t2 += opts.preParseCharacterMapping[cr] === undefined ? cr : opts.preParseCharacterMapping[cr];
            }
            test = t2;
          }
          rval = Number.parseFloat(test);
        }
      } else {
        Logger.warn('Value is of type %s, returning default', type);
        rval = opts.ifNotNumber;
      }

      if (isNaN(rval)) {
        Logger.debug('Parsed string to NaN - using NaN value from param');
        rval = opts.ifNotNumber;
      }
    }

    return rval;
  }

  public static numberCSVToList(inputCSV: string): number[] {
    let rval: number[] = null;
    if (inputCSV) {
      rval = inputCSV.split(',').map((s) => {
        return NumberRatchet.safeNumber(s.trim());
      });
      rval = rval.filter((r) => typeof r === 'number' && !isNaN(r));
    }
    return rval;
  }

  public static fitToWindow(val: number, b1: number, b2: number): number {
    let rval: number = val;
    if (val === null || b1 === null || b2 === null || b1 < 0 || b2 < 0 || val < 0) {
      throw new Error('All values must be non-null and larger than 0');
    }
    const low: number = Math.min(b1, b2);
    const high: number = Math.max(b1, b2);
    const windowSize: number = high - low;
    if (high === low) {
      // If the bounds are the same the answer is always the same
      rval = high;
    } else {
      // Not super efficient (I should use modulo here) but works for the moment
      while (rval < low) {
        rval += windowSize;
      }
      while (rval > high) {
        rval -= windowSize;
      }
    }

    return rval;
  }

  public static groupNumbersIntoContiguousRanges(inputData: number[], minRangeSize = 3): SinglesAndRanges {
    RequireRatchet.notNullOrUndefined(inputData);
    const input: number[] = Object.assign([], inputData);
    input.sort((a, b) => a - b);

    const singles: number[] = [];
    const ranges: NumberRange[] = [];
    let start = 0;
    for (let i = 1; i < input.length; i++) {
      if (input[i] === input[i - 1] + 1) {
        // Just advance
      } else {
        // End of sequence, either single or range
        if (start === i - 1) {
          singles.push(input[i - 1]);
        } else {
          const rangeSize: number = i - start;
          if (rangeSize < minRangeSize) {
            for (let j = start; j < i; j++) {
              singles.push(input[j]);
            }
          } else {
            ranges.push({
              min: input[start],
              max: input[i - 1],
            });
          }
        }
        // Either way, advance start
        start = i;
      }
    }
    return {
      singles: singles,
      ranges: ranges,
    };
  }

  // Given N items and M buckets, return how many items in each bucket, as even as
  // possible
  public static distributeItemsEvenly(items: number, buckets: number): number[] {
    RequireRatchet.notNullOrUndefined(items, 'items');
    RequireRatchet.notNullOrUndefined(buckets, 'buckets');
    RequireRatchet.true(items > 0 && items === Math.floor(items), 'Items integer larger than 0');
    RequireRatchet.true(buckets > 0 && buckets === Math.floor(buckets), 'Buckets integer larger than 0');

    const offset: number = buckets / items;
    const rval: number[] = [];
    for (let i = 0; i < buckets; i++) {
      rval.push(0);
    }

    let loc: number = 0;
    let rem: number = items;

    while (rem > 0) {
      rval[Math.floor(loc) % buckets]++;
      rem--;
      loc += offset;
    }

    return rval;
  }

  // Just creates an array of numbers between 2 bounds
  public static createRange(minInclusive: number, maxExclusive: number, step: number = 1): number[] {
    const rval: number[] = [];
    let val: number = minInclusive;
    while (val < maxExclusive) {
      rval.push(val);
      val += step;
    }
    return rval;
  }
}

export interface SinglesAndRanges {
  singles: number[];
  ranges: NumberRange[];
}

export interface NumberRange {
  min: number;
  max: number;
}

export interface SafeNumberOptions {
  ifNotNumber: number; // Value to return if the passed value was not a number
  returnValueForNull: number;
  returnValueForUndefined: number;
  preParseCharacterMapping: Record<string, string>; // Replaces any characters on the left side with the right - used to remove the thousand separators and convert for euro currencies
}
