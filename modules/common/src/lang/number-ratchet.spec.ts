import { NumberRatchet, SinglesAndRanges } from './number-ratchet.js';
import fs from 'fs';
import path from 'path';
import { EsmRatchet } from './esm-ratchet.js';
import { describe, expect, test } from 'vitest';

describe('#toFixedDecimalNumber', function () {
  test('should convert "5.1234 to 5.12', function () {
    expect(NumberRatchet.toFixedDecimalNumber(5.1234, 2)).toEqual(5.12);
    expect(NumberRatchet.toFixedDecimalNumber('5.1234', 2)).toEqual(5.12);
  });

  test('should convert "5.5678 to 5.57', function () {
    expect(NumberRatchet.toFixedDecimalNumber(5.5678, 2)).toEqual(5.57);
    expect(NumberRatchet.toFixedDecimalNumber('5.5678', 2)).toEqual(5.57);
  });
});

describe('#leadingZeros', function () {
  test('should convert "5" to 05', function () {
    const result: string = NumberRatchet.leadingZeros('5', 2);
    expect(result).toEqual('05');
  });

  test('should leave 166 alone', function () {
    const result: string = NumberRatchet.leadingZeros('166', 2);
    expect(result).toEqual('166');
  });
});

describe('#safeToNumber', function () {
  test('should convert "55" to 55', function () {
    const result: number = NumberRatchet.safeNumber('55');
    expect(result).toEqual(55);
  });

  test('should convert "574,528" to 574528', function () {
    const result: number = NumberRatchet.safeNumber('574,528');
    expect(result).toEqual(574528);
  });

  test('should convert "574.528,88" to 574528.88 like european', function () {
    const result: number = NumberRatchet.safeNumberOpt('574.528,88', { preParseCharacterMapping: { '.': '', ',': '.' } });
    expect(result).toEqual(574528.88);
  });

  test('should leave 66 alone', function () {
    const result: number = NumberRatchet.safeNumber(66);
    expect(result).toEqual(66);
  });

  test('should return the default when it cannot parse', function () {
    const result: number = NumberRatchet.safeNumber({ test: 'test' }, 42);
    expect(result).toEqual(42);
  });

  test('should return the default for the empty string', function () {
    const result: number = NumberRatchet.safeNumber({ test: '' }, 42);
    expect(result).toEqual(42);
  });

  test('should return the default for null/undefined if set true', function () {
    const result: number = NumberRatchet.safeNumber(null, 42, true);
    expect(result).toEqual(42);
    const result2: number = NumberRatchet.safeNumber(undefined, 46, true);
    expect(result2).toEqual(46);
  });

  test('should return the passed value for null/undefined if set false', function () {
    const result: number = NumberRatchet.safeNumber(null, 42, false);
    expect(result).toEqual(null);
    const result2: number = NumberRatchet.safeNumber(undefined, 46, false);
    expect(result2).toEqual(undefined);
  });

  test('should return null for an undefined input by default', function () {
    const result: number | null = NumberRatchet.safeNumber(undefined, 0);
    expect(result).toEqual(null);
  });

  test('should return null for a null input by default', function () {
    const result: number = NumberRatchet.safeNumber(null, 42);
    expect(result).toEqual(null);
  });
});

describe('#parseCSV', function () {
  test('should convert "1,2,3" to [1,2,3]', function () {
    const result: number[] = NumberRatchet.numberCSVToList('1,2,3');
    expect(result.length).toEqual(3);
  });

  test('should convert " 1, 2,3  " to [1,2,3]', function () {
    const result: number[] = NumberRatchet.numberCSVToList(' 1, 2,3 ');
    expect(result.length).toEqual(3);
  });

  test('should convert " a1, 2,b  " to [2]', function () {
    const result: number[] = NumberRatchet.numberCSVToList(' a1, 2,b  ');
    expect(result.length).toEqual(1);
    expect(result[0]).toEqual(2);
  });
});

describe('#fitToWindow', function () {
  test('should fit input to the window', function () {
    expect(NumberRatchet.fitToWindow(5, 8, 10)).toEqual(9);
    expect(NumberRatchet.fitToWindow(8, 2, 10)).toEqual(8);
    expect(NumberRatchet.fitToWindow(8, 9, 9)).toEqual(9);
    expect(NumberRatchet.fitToWindow(12, 2, 10)).toEqual(4);
  });
});

describe('#groupNumbersIntoContiguousRanges', function () {
  test('should group numbers', function () {
    let input: number[] = JSON.parse(
      fs.readFileSync(path.join(EsmRatchet.fetchDirName(import.meta.url), '../../../../test-data/number_set.json')).toString(),
    );
    input = input.map((i) => NumberRatchet.safeNumber(i));
    const grouped: SinglesAndRanges = NumberRatchet.groupNumbersIntoContiguousRanges(input, 5);
    expect(grouped).toBeTruthy();
  });
});

describe('#distributeItemsEvenly', function () {
  test('should distribute evenly', function () {
    const test1: number[] = NumberRatchet.distributeItemsEvenly(4, 6);
    expect(test1).toBeTruthy();
    const test2: number[] = NumberRatchet.distributeItemsEvenly(12, 6);
    expect(test2).toBeTruthy();
    const test3: number[] = NumberRatchet.distributeItemsEvenly(5, 6);
    expect(test3).toBeTruthy();
    const test4: number[] = NumberRatchet.distributeItemsEvenly(192, 11);
    expect(test4).toBeTruthy();
    const test5: number[] = NumberRatchet.distributeItemsEvenly(11, 192);
    expect(test5).toBeTruthy();
  });
});

describe('#createRange', function () {
  test('should create ranges', function () {
    const test1: number[] = NumberRatchet.createRange(0, 5, 1);
    expect(test1).toBeTruthy();
    expect(test1.length).toEqual(5);

    const test2: number[] = NumberRatchet.createRange(1, 5, 1);
    expect(test2).toBeTruthy();
    expect(test2.length).toEqual(4);

    const test3: number[] = NumberRatchet.createRange(0, 10, 2);
    expect(test3).toBeTruthy();
    expect(test3.length).toEqual(5);
  });
});
