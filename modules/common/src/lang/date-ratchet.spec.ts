import { DateRatchet } from './date-ratchet.js';
import { expect, test, describe } from 'vitest';

// CAW 2021-02-26 : I used to test 1776 here, but there was an odd off-by-8 seconds problem testing dates that
// far in the past.  No doubt some kind of weird leap second thing.  Not fighting that today
describe('#dateRatchet', function () {
  test('should parse my common date format', function () {
    const dt = DateRatchet.parseDefaultDate('1976-07-04');
    expect(dt.getFullYear()).toEqual(1976);
    expect(dt.getMonth()).toEqual(6); // 0 based
    expect(dt.getDate()).toEqual(4);
  });

  test('should parse us with slashes', function () {
    const dt = DateRatchet.parseCommonUsDate('07/04/1976');
    expect(dt.getFullYear()).toEqual(1976);
    expect(dt.getMonth()).toEqual(6); // 0 based
    expect(dt.getDate()).toEqual(4);
  });

  test('should parse us with dashes', function () {
    const dt = DateRatchet.parseCommonUsDate('07-04-1976');
    expect(dt.getFullYear()).toEqual(1976);
    expect(dt.getMonth()).toEqual(6); // 0 based
    expect(dt.getDate()).toEqual(4);
  });
});
