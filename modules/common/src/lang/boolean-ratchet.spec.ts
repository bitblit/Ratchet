import { BooleanRatchet } from './boolean-ratchet.js';
import { NumberRatchet } from './number-ratchet.js';

describe('#parseBool', function () {
  it('should check all true', function () {
    expect(BooleanRatchet.allTrue(null)).toEqual(false);
    expect(BooleanRatchet.allTrue([])).toEqual(false);
    expect(BooleanRatchet.allTrue([], true)).toEqual(true);
    expect(BooleanRatchet.allTrue([true])).toEqual(true);
    expect(BooleanRatchet.allTrue([true, true])).toEqual(true);
    expect(BooleanRatchet.allTrue([true, false, true])).toEqual(false);
    expect(BooleanRatchet.allTrue([false])).toEqual(false);
    expect(BooleanRatchet.allTrue([false, false])).toEqual(false);
  });
  it('should check any true', function () {
    expect(BooleanRatchet.anyTrue(null)).toEqual(false);
    expect(BooleanRatchet.anyTrue([])).toEqual(false);
    expect(BooleanRatchet.anyTrue([], true)).toEqual(true);
    expect(BooleanRatchet.anyTrue([true])).toEqual(true);
    expect(BooleanRatchet.anyTrue([true, true])).toEqual(true);
    expect(BooleanRatchet.anyTrue([true, false, true])).toEqual(true);
    expect(BooleanRatchet.anyTrue([false])).toEqual(false);
    expect(BooleanRatchet.anyTrue([false, false])).toEqual(false);
  });

  it('should xxx', function () {
    const val: string = 'false';
    const r1: boolean = BooleanRatchet.parseBool(val);
    const r2: boolean = BooleanRatchet.intToBool(val);

    const result: boolean = BooleanRatchet.parseBool(val) || BooleanRatchet.intToBool(NumberRatchet.safeNumber(val));
    expect(result).toEqual(false);
  });

  it('should parse the string true as true', function () {
    const result = BooleanRatchet.parseBool('true');
    expect(result).toEqual(true);
  });

  it('should parse the string TRUE as true', function () {
    const result = BooleanRatchet.parseBool('TRUE');
    expect(result).toEqual(true);
  });

  it('should parse the boolean true as true', function () {
    const result = BooleanRatchet.parseBool(true);
    expect(result).toEqual(true);
  });

  it('should parse the empty string as false', function () {
    const result = BooleanRatchet.parseBool('');
    expect(result).toEqual(false);
  });

  it('should parse null as false', function () {
    const result = BooleanRatchet.parseBool(null);
    expect(result).toEqual(false);
  });

  it('should parse "asdf" as false', function () {
    const result = BooleanRatchet.parseBool('asdf');
    expect(result).toEqual(false);
  });
});

describe('#intToBool', function () {
  it('should parse null as false', function () {
    const result = BooleanRatchet.intToBool(null);
    expect(result).toEqual(false);
  });

  it('should parse 0 as false', function () {
    const result = BooleanRatchet.intToBool(0);
    expect(result).toEqual(false);
  });

  it('should parse "0" as false', function () {
    const result = BooleanRatchet.intToBool('0');
    expect(result).toEqual(false);
  });

  it('should parse 1 as true', function () {
    const result = BooleanRatchet.intToBool(1);
    expect(result).toEqual(true);
  });

  it('should parse "1" as true', function () {
    const result = BooleanRatchet.intToBool('1');
    expect(result).toEqual(true);
  });

  it('should parse "2" as true', function () {
    const result = BooleanRatchet.intToBool('2');
    expect(result).toEqual(true);
  });
});
