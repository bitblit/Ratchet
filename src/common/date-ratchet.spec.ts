import { DateRatchet } from './date-ratchet';

describe('#dateRatchet', function () {
  it('should parse my common date format', function () {
    const dt = DateRatchet.parseDefaultDate('1776-07-04');
    expect(dt.getFullYear()).toEqual(1776);
    expect(dt.getMonth()).toEqual(6); // 0 based
    expect(dt.getDay()).toEqual(4);
  });

  it('should parse us with slashes', function () {
    const dt = DateRatchet.parseCommonUsDate('07/04/1776');
    expect(dt.getFullYear()).toEqual(1776);
    expect(dt.getMonth()).toEqual(6); // 0 based
    expect(dt.getDay()).toEqual(4);
  });

  it('should parse us with dashes', function () {
    const dt = DateRatchet.parseCommonUsDate('07-04-1776');
    expect(dt.getFullYear()).toEqual(1776);
    expect(dt.getMonth()).toEqual(6); // 0 based
    expect(dt.getDay()).toEqual(4);
  });
});
