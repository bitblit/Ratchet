import { ArrayRatchet, MatchReport } from './array-ratchet.js';
import { expect, test, describe } from 'vitest';

const sortedArr: any[] = [
  {
    n: 'test1',
    v: 1,
  },
  {
    n: 'test1',
    v: 2,
  },
  {
    n: 'test1',
    v: 4,
  },
  {
    n: 'test1',
    v: 4,
  },
  {
    n: 'test1',
    v: 7,
  },
  {
    n: 'test1',
    v: 12,
  },
  {
    n: 'test1',
    v: 25,
  },
  {
    n: 'test1',
    v: 30,
  },
];

describe('#extractSubarrayFromSortedByNumberField', function () {
  test('should extract the subarray', function () {
    const subArr1: any[] = ArrayRatchet.extractSubarrayFromSortedByNumberField(sortedArr, 'v', 5, 14);
    expect(subArr1.length).toEqual(2);

    const subArr2: any[] = ArrayRatchet.extractSubarrayFromSortedByNumberField(sortedArr, 'v', null, 4);
    expect(subArr2.length).toEqual(4);

    const subArr3: any[] = ArrayRatchet.extractSubarrayFromSortedByNumberField(sortedArr, 'v', 7, null);
    expect(subArr3.length).toEqual(4);
  });
});

describe('#compareTwoArrays', function () {
  test('should create a match report', function () {
    const arr1: string[] = ['a', 'b', 'c'];
    const arr2: string[] = ['a', 'e', 'i', 'o', 'u'];

    const report: MatchReport<string> = ArrayRatchet.compareTwoArrays(arr1, arr2, (a, b) => a.localeCompare(b));

    expect(report).toBeTruthy();
    expect(report.setOneOnly.length).toEqual(2);
    expect(report.setTwoOnly.length).toEqual(4);
    expect(report.matching.length).toEqual(1);
  });
});

describe('#findSplit', function () {
  test('should find the split', function () {
    // All values past the split point should be larger than the target
    const split10: number = ArrayRatchet.findSplit(sortedArr, 'v', 10);
    const split4: number = ArrayRatchet.findSplit(sortedArr, 'v', 4);
    const split0: number = ArrayRatchet.findSplit(sortedArr, 'v', 0);
    const split32: number = ArrayRatchet.findSplit(sortedArr, 'v', 32);

    expect(split10).toEqual(4);
    expect(split4).toEqual(3);
    expect(split0).toEqual(null);
    expect(split32).toEqual(7);
  });
});
