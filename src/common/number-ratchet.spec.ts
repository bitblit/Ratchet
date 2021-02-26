import { NumberRatchet, Point2d, SinglesAndRanges } from './number-ratchet';
import fs from 'fs';
import path from 'path';
import __ = require('lodash/fp/__');

describe('#toFixedDecimalNumber', function () {
  it('should convert "5.1234 to 5.12', function () {
    expect(NumberRatchet.toFixedDecimalNumber(5.1234, 2)).toEqual(5.12);
    expect(NumberRatchet.toFixedDecimalNumber('5.1234', 2)).toEqual(5.12);
  });

  it('should convert "5.5678 to 5.57', function () {
    expect(NumberRatchet.toFixedDecimalNumber(5.5678, 2)).toEqual(5.57);
    expect(NumberRatchet.toFixedDecimalNumber('5.5678', 2)).toEqual(5.57);
  });
});

describe('#leadingZeros', function () {
  it('should convert "5" to 05', function () {
    const result: string = NumberRatchet.leadingZeros('5', 2);
    expect(result).toEqual('05');
  });

  it('should leave 166 alone', function () {
    const result: string = NumberRatchet.leadingZeros('166', 2);
    expect(result).toEqual('166');
  });
});

describe('#safeToNumber', function () {
  it('should convert "55" to 55', function () {
    const result: number = NumberRatchet.safeNumber('55');
    expect(result).toEqual(55);
  });

  it('should leave 66 alone', function () {
    const result: number = NumberRatchet.safeNumber(66);
    expect(result).toEqual(66);
  });

  it('should return the default when it cannot parse', function () {
    const result: number = NumberRatchet.safeNumber({ test: 'test' }, 42);
    expect(result).toEqual(42);
  });

  it('should return the default for the empty string', function () {
    const result: number = NumberRatchet.safeNumber({ test: '' }, 42);
    expect(result).toEqual(42);
  });
});

describe('#parseCSV', function () {
  it('should convert "1,2,3" to [1,2,3]', function () {
    const result: number[] = NumberRatchet.numberCSVToList('1,2,3');
    expect(result.length).toEqual(3);
  });

  it('should convert " 1, 2,3  " to [1,2,3]', function () {
    const result: number[] = NumberRatchet.numberCSVToList(' 1, 2,3 ');
    expect(result.length).toEqual(3);
  });

  it('should convert " a1, 2,b  " to [2]', function () {
    const result: number[] = NumberRatchet.numberCSVToList(' a1, 2,b  ');
    expect(result.length).toEqual(1);
    expect(result[0]).toEqual(2);
  });
});

describe('#fitCurve', function () {
  it('should fit input to curve', function () {
    const curve: Point2d[] = [
      { x: 0, y: 50 },
      { x: 0.5, y: 50 },
      { x: 0.8, y: 60 },
      { x: 1, y: 70 },
      { x: 1.2, y: 80 },
      { x: 1.5, y: 90 },
      { x: 1.6, y: 91 },
      { x: 1.7, y: 92 },
      { x: 1.8, y: 93 },
      { x: 1.9, y: 94 },
      { x: 2, y: 95 },
      {
        x: 3,
        y: 98,
      },
      { x: 4, y: 99 },
      { x: 5, y: 100 },
    ];

    expect(NumberRatchet.fitCurve(curve, -1)).toEqual(50);
    expect(NumberRatchet.fitCurve(curve, 0)).toEqual(50);
    expect(NumberRatchet.fitCurve(curve, 0.3)).toEqual(50);
    expect(NumberRatchet.fitCurve(curve, 0.5)).toEqual(50);
    expect(NumberRatchet.fitCurve(curve, 0.8)).toEqual(60);
    expect(NumberRatchet.fitCurve(curve, 1)).toEqual(70);
    expect(NumberRatchet.fitCurve(curve, 5)).toEqual(100);
    expect(NumberRatchet.fitCurve(curve, 6)).toEqual(100);
    expect(NumberRatchet.fitCurve(curve, 1.65)).toEqual(91.5);
  });
});

describe('#fitToWindow', function () {
  it('should fit input to the window', function () {
    expect(NumberRatchet.fitToWindow(5, 8, 10)).toEqual(9);
    expect(NumberRatchet.fitToWindow(8, 2, 10)).toEqual(8);
    expect(NumberRatchet.fitToWindow(8, 9, 9)).toEqual(9);
    expect(NumberRatchet.fitToWindow(12, 2, 10)).toEqual(4);
  });
});

describe('#groupNumbersIntoContiguousRanges', function () {
  it('should group numbers', function () {
    let input: number[] = JSON.parse(fs.readFileSync(path.join(__dirname, '../../test-data/number_set.json')).toString());
    input = input.map((i) => NumberRatchet.safeNumber(i));
    const grouped: SinglesAndRanges = NumberRatchet.groupNumbersIntoContiguousRanges(input, 5);
    expect(grouped).toBeTruthy();
  });
});

describe('#distributeItemsEvenly', function () {
  it('should distribute evenly', function () {
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
