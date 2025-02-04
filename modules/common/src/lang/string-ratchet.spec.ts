import { StringRatchet } from './string-ratchet.js';
import { expect, test, describe } from 'vitest';

describe('#formatBytes', function () {
  test('should format 0 bytes correctly', function () {
    const result = StringRatchet.formatBytes(0);
    expect(result).toEqual('0 Bytes');
  });

  test('should format less than a Kb correctly', function () {
    const result = StringRatchet.formatBytes(123);
    expect(result).toEqual('123 Bytes');
  });

  test('should format less than a Mb correctly', function () {
    const result = StringRatchet.formatBytes(1024);
    expect(result).toEqual('1 KB');
  });

  test('should format less than a Mb correctly with 3 decimals', function () {
    const result = StringRatchet.formatBytes(1234, 3);
    expect(result).toEqual('1.205 KB');
  });
});

describe('#safeToString', function () {
  test('should return "asdf"', function () {
    const result = StringRatchet.safeString('asdf');
    expect(result).toEqual('asdf');
  });

  test('should return "55"', function () {
    const result = StringRatchet.safeString(55);
    expect(result).toEqual('55');
  });
});

describe('#obscure', function () {
  test('should return "pa****rd"', function () {
    const result = StringRatchet.obscure('password', 2, 2);
    expect(result).toEqual('pa****rd');
  });

  test('should return null', function () {
    const result = StringRatchet.obscure(null, 2, 2);
    expect(result).toBeNull();
  });

  test('should return "p**s"', function () {
    const result = StringRatchet.obscure('pass', 2, 2);
    expect(result).toEqual('p**s');
  });

  test('should return "****"', function () {
    const result = StringRatchet.obscure('pass', 0, 0);
    expect(result).toEqual('****');
  });

  test('should return "p***"', function () {
    const result = StringRatchet.obscure('pass', 1, 0);
    expect(result).toEqual('p***');
  });

  test('should return "***s"', function () {
    const result = StringRatchet.obscure('pass', 0, 1);
    expect(result).toEqual('***s');
  });
});

describe('#guid', function () {
  test('should generate a guid"', function () {
    const result = StringRatchet.createType4Guid();
    expect(result).toBeTruthy();
  });
});

describe('#randomHexString', function () {
  test('should generate a random hex string"', function () {
    const result = StringRatchet.createRandomHexString(12);
    expect(result).toBeTruthy();
    expect(result.length).toEqual(12);
  });
});

describe('#leadingZeros', function () {
  test('should generate string with leading zeros"', function () {
    const result = StringRatchet.leadingZeros(25, 4);
    expect(result).toEqual('0025');
  });

  test('should generate string with leading zeros and a negative sign"', function () {
    const result = StringRatchet.leadingZeros(-8, 2);
    expect(result).toEqual('-08');
  });
});

describe('#stripNonNumeric', function () {
  test('should return a string containing only numbers"', function () {
    const result: string = StringRatchet.stripNonNumeric('702-555-1212');
    expect(result).toEqual('7025551212');
  });
});

describe('#stringContainsOnly', function () {
  test('should check string contains only valid chars"', function () {
    expect(StringRatchet.stringContainsOnly('test', 'tes')).toBeTruthy();
    expect(StringRatchet.stringContainsOnly('test', 'teg')).toBeFalsy();

    expect(StringRatchet.stringContainsOnlyAlphanumeric('test')).toBeTruthy();
    expect(StringRatchet.stringContainsOnlyAlphanumeric('tes-')).toBeFalsy();

    expect(StringRatchet.stringContainsOnlyHex('1a3')).toBeTruthy();
    expect(StringRatchet.stringContainsOnlyHex('test')).toBeFalsy();
  });
});

describe('#stringCsvSafe', function () {
  test('should make values safe to place in a CSV"', function () {
    expect(StringRatchet.csvSafe('test')).toEqual('test');
    expect(StringRatchet.csvSafe('test,and 1')).toEqual('"test,and 1"');
    expect(StringRatchet.csvSafe(1)).toEqual('1');
    expect(StringRatchet.csvSafe("test'blah")).toEqual('"test\'blah"');
  });
});

describe('#trimToEmpty', function () {
  test('should return an empty string for null"', function () {
    const result: string = StringRatchet.trimToEmpty(null);
    expect(result).toEqual('');
  });

  test('should return an empty string for undefined"', function () {
    const result: string = StringRatchet.trimToEmpty(undefined);
    expect(result).toEqual('');
  });

  test('should return an empty string"', function () {
    const result: string = StringRatchet.trimToEmpty('     ');
    expect(result).toEqual('');
  });

  test('should return an abc"', function () {
    const result: string = StringRatchet.trimToEmpty('abc   ');
    expect(result).toEqual('abc');
  });

  test('should return string "5"', function () {
    const result: string = StringRatchet.trimToEmpty(5 as any); // as any to fool TSC for testing
    expect(result).toEqual('5');
  });
});

describe('#trimStringPropertiesInPlace', function () {
  test('should trim properties to null"', function () {
    const test: any = {
      a: 'test   ',
      b: 1,
      c: '    test',
      d: null,
      e: '     ',
    };
    const nullResult: any = StringRatchet.trimAllStringPropertiesToNullInPlace<any>(test);

    expect(nullResult).not.toBeNull();
    expect(nullResult['a']).toEqual('test');
    expect(nullResult['b']).toEqual(1);
    expect(nullResult['c']).toEqual('test');
    expect(nullResult['d']).toEqual(null);
    expect(nullResult['e']).toEqual(null);
  });

  test('should trim properties to empty"', function () {
    const test: any = {
      a: 'test   ',
      b: 1,
      c: '    test',
      d: null,
      e: '     ',
    };
    const emptyResult: any = StringRatchet.trimAllStringPropertiesToEmptyInPlace<any>(test);

    expect(emptyResult).not.toBeNull();
    expect(emptyResult['a']).toEqual('test');
    expect(emptyResult['b']).toEqual(1);
    expect(emptyResult['c']).toEqual('test');
    expect(emptyResult['d']).toEqual(null);
    expect(emptyResult['e']).toEqual('');
  });
});

describe('#createShortUid', function () {
  test('should return a short uid', function () {
    for (let i = 0; i < 20; i++) {
      console.log(StringRatchet.createShortUid());
    }

    const result: string = StringRatchet.createShortUid();
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('#circSafeFormat', function () {
  test('should format correctly when contents are circular', function () {
    const testOb: any = {
      a: 1,
      b: 2,
    };
    testOb['c'] = testOb;
    const out: string = StringRatchet.format('This is a test : %j', testOb);
    expect(out).not.toBeNull;
  });
});

describe('substring finder', () => {
  test('should detect substring', () => {
    expect(StringRatchet.longestNonOverlappingRepeatingSubstring('abc123abc')).toEqual('abc');
    expect(StringRatchet.longestNonOverlappingRepeatingSubstring('abc123456')).toEqual(null);
  });
});
