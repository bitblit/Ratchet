import { expect } from 'chai';
import { NumberRatchet, Point2d, SinglesAndRanges } from '../../src/common/number-ratchet';
import * as fs from 'fs';

describe('#toFixedDecimalNumber', function () {
  it('should convert "5.1234 to 5.12', function () {
    expect(NumberRatchet.toFixedDecimalNumber(5.1234, 2)).to.eq(5.12);
    expect(NumberRatchet.toFixedDecimalNumber('5.1234', 2)).to.eq(5.12);
  });

  it('should convert "5.5678 to 5.57', function () {
    expect(NumberRatchet.toFixedDecimalNumber(5.5678, 2)).to.eq(5.57);
    expect(NumberRatchet.toFixedDecimalNumber('5.5678', 2)).to.eq(5.57);
  });
});

describe('#leadingZeros', function () {
  it('should convert "5" to 05', function () {
    const result: string = NumberRatchet.leadingZeros('5', 2);
    expect(result).to.equal('05');
  });

  it('should leave 166 alone', function () {
    const result: string = NumberRatchet.leadingZeros('166', 2);
    expect(result).to.equal('166');
  });
});

describe('#safeToNumber', function () {
  it('should convert "55" to 55', function () {
    const result: number = NumberRatchet.safeNumber('55');
    expect(result).to.equal(55);
  });

  it('should leave 66 alone', function () {
    const result: number = NumberRatchet.safeNumber(66);
    expect(result).to.equal(66);
  });

  it('should return the default when it cannot parse', function () {
    const result: number = NumberRatchet.safeNumber({ test: 'test' }, 42);
    expect(result).to.equal(42);
  });

  it('should return the default for the empty string', function () {
    const result: number = NumberRatchet.safeNumber({ test: '' }, 42);
    expect(result).to.equal(42);
  });
});

describe('#parseCSV', function () {
  it('should convert "1,2,3" to [1,2,3]', function () {
    const result: number[] = NumberRatchet.numberCSVToList('1,2,3');
    expect(result.length).to.equal(3);
  });

  it('should convert " 1, 2,3  " to [1,2,3]', function () {
    const result: number[] = NumberRatchet.numberCSVToList(' 1, 2,3 ');
    expect(result.length).to.equal(3);
  });

  it('should convert " a1, 2,b  " to [2]', function () {
    const result: number[] = NumberRatchet.numberCSVToList(' a1, 2,b  ');
    expect(result.length).to.equal(1);
    expect(result[0]).to.equal(2);
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

    expect(NumberRatchet.fitCurve(curve, -1)).to.eq(50);
    expect(NumberRatchet.fitCurve(curve, 0)).to.eq(50);
    expect(NumberRatchet.fitCurve(curve, 0.3)).to.eq(50);
    expect(NumberRatchet.fitCurve(curve, 0.5)).to.eq(50);
    expect(NumberRatchet.fitCurve(curve, 0.8)).to.eq(60);
    expect(NumberRatchet.fitCurve(curve, 1)).to.eq(70);
    expect(NumberRatchet.fitCurve(curve, 5)).to.eq(100);
    expect(NumberRatchet.fitCurve(curve, 6)).to.eq(100);
    expect(NumberRatchet.fitCurve(curve, 1.65)).to.eq(91.5);
  });
});

describe('#fitToWindow', function () {
  it('should fit input to the window', function () {
    expect(NumberRatchet.fitToWindow(5, 8, 10)).to.eq(9);
    expect(NumberRatchet.fitToWindow(8, 2, 10)).to.eq(8);
    expect(NumberRatchet.fitToWindow(8, 9, 9)).to.eq(9);
    expect(NumberRatchet.fitToWindow(12, 2, 10)).to.eq(4);
  });
});

describe('#groupNumbersIntoContiguousRanges', function () {
  it('should group numbers', function () {
    let input: number[] = JSON.parse(fs.readFileSync('test/data/number_set.json').toString());
    input = input.map((i) => NumberRatchet.safeNumber(i));
    const grouped: SinglesAndRanges = NumberRatchet.groupNumbersIntoContiguousRanges(input, 5);
    expect(grouped).to.not.be.null;
  });
});

describe('#distributeItemsEvenly', function () {
  it('should distribute evenly', function () {
    const test1: number[] = NumberRatchet.distributeItemsEvenly(4, 6);
    expect(test1).to.not.be.null;
    const test2: number[] = NumberRatchet.distributeItemsEvenly(12, 6);
    expect(test2).to.not.be.null;
    const test3: number[] = NumberRatchet.distributeItemsEvenly(5, 6);
    expect(test3).to.not.be.null;
    const test4: number[] = NumberRatchet.distributeItemsEvenly(192, 11);
    expect(test4).to.not.be.null;
    const test5: number[] = NumberRatchet.distributeItemsEvenly(11, 192);
    expect(test5).to.not.be.null;
  });
});
