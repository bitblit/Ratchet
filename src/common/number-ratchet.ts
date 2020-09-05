/*
    Functions for working with numbers

    Functions to not write:
    - to fixed precision (use lodash round instead)
*/

import { Logger } from './logger';
import { RequireRatchet } from './require-ratchet';

export class NumberRatchet {
  private static MAX_LEADING_ZEROS_FORMAT_LENGTH = 1000; // Because really, why?

  public static toFixedDecimalNumber(input: number | string, placesAfterPoint: number): number {
    const v: number = NumberRatchet.safeNumber(input);
    return NumberRatchet.safeNumber(v.toFixed(placesAfterPoint));
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

  // If its a number, leave it alone, if its a string, parse it, anything else, use the default
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public static safeNumber(input: any, ifNotNumber: number = null): number {
    let rval: number = null;
    if (input != null) {
      const type: string = typeof input;
      if (type == 'number') {
        rval = input;
      } else if (type == 'string') {
        if (input.trim().length === 0) {
          rval = ifNotNumber;
        } else {
          rval = Number.parseFloat(input);
        }
      } else {
        Logger.warn('Value is of type %s, returning default', type);
        rval = ifNotNumber;
      }

      if (isNaN(rval)) {
        Logger.debug('Parsed string to NaN - using NaN value from param');
        rval = ifNotNumber;
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

  public static fitCurve(curveDef: Point2d[], inputX: number): number {
    curveDef.sort((a, b) => {
      return a.x - b.x;
    });

    if (inputX <= curveDef[0].x) {
      return curveDef[0].y;
    } else if (inputX >= curveDef[curveDef.length - 1].x) {
      return curveDef[curveDef.length - 1].y;
    } else {
      let idx = 0;
      while (curveDef[idx + 1].x < inputX) {
        idx++;
      }
      const xSpread: number = curveDef[idx + 1].x - curveDef[idx].x;
      const ySpread: number = curveDef[idx + 1].y - curveDef[idx].y;
      const pct: number = (inputX - curveDef[idx].x) / xSpread;
      const yAdd: number = pct * ySpread;
      return curveDef[idx].y + yAdd;
    }
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
}

export interface Point2d {
  x: number;
  y: number;
}

export interface SinglesAndRanges {
  singles: number[];
  ranges: NumberRange[];
}

export interface NumberRange {
  min: number;
  max: number;
}
