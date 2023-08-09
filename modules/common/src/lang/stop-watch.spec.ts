describe('#formatBytes', function () {
  it('should calculate remaining correctly', function () {
    const result = StringRatchet.formatBytes(0);
    expect(result).toEqual('0 Bytes');
  });

  it('should format less than a Kb correctly', function () {
    const result = StringRatchet.formatBytes(123);
    expect(result).toEqual('123 Bytes');
  });

  it('should format less than a Mb correctly', function () {
    const result = StringRatchet.formatBytes(1024);
    expect(result).toEqual('1 KB');
  });

  it('should format less than a Mb correctly with 3 decimals', function () {
    const result = StringRatchet.formatBytes(1234, 3);
    expect(result).toEqual('1.205 KB');
  });
});

describe('#safeToString', function () {
  it('should return "asdf"', function () {
    const result = StringRatchet.safeString('asdf');
    expect(result).toEqual('asdf');
  });

  it('should return "55"', function () {
    const result = StringRatchet.safeString(55);
    expect(result).toEqual('55');
  });
});

describe('#obscure', function () {
  it('should return "pa****rd"', function () {
    const result = StringRatchet.obscure('password', 2, 2);
    expect(result).toEqual('pa****rd');
  });

  it('should return null', function () {
    const result = StringRatchet.obscure(null, 2, 2);
    expect(result).toBeNull();
  });

  it('should return "p**s"', function () {
    const result = StringRatchet.obscure('pass', 2, 2);
    expect(result).toEqual('p**s');
  });

  it('should return "****"', function () {
    const result = StringRatchet.obscure('pass', 0, 0);
    expect(result).toEqual('****');
  });

  it('should return "p***"', function () {
    const result = StringRatchet.obscure('pass', 1, 0);
    expect(result).toEqual('p***');
  });

  it('should return "***s"', function () {
    const result = StringRatchet.obscure('pass', 0, 1);
    expect(result).toEqual('***s');
  });
});

describe('#guid', function () {
  it('should generate a guid"', function () {
    const result = StringRatchet.createType4Guid();
    expect(result).toBeTruthy();
  });
});

describe('#randomHexString', function () {
  it('should generate a random hex string"', function () {
    const result = StringRatchet.createRandomHexString(12);
    expect(result).toBeTruthy();
    expect(result.length).toEqual(12);
  });
});

describe('#leadingZeros', function () {
  it('should generate string with leading zeros"', function () {
    const result = StringRatchet.leadingZeros(25, 4);
    expect(result).toEqual('0025');
  });

  it('should generate string with leading zeros and a negative sign"', function () {
    const result = StringRatchet.leadingZeros(-8, 2);
    expect(result).toEqual('-08');
  });
});

describe('#stripNonNumeric', function () {
  it('should return a string containing only numbers"', function () {
    const result: string = StringRatchet.stripNonNumeric('702-555-1212');
    expect(result).toEqual('7025551212');
  });
});

describe('#stringContainsOnly', function () {
  it('should check string contains only valid chars"', function () {
    expect(StringRatchet.stringContainsOnly('test', 'tes')).toBeTruthy();
    expect(StringRatchet.stringContainsOnly('test', 'teg')).toBeFalsy();

    expect(StringRatchet.stringContainsOnlyAlphanumeric('test')).toBeTruthy();
    expect(StringRatchet.stringContainsOnlyAlphanumeric('tes-')).toBeFalsy();

    expect(StringRatchet.stringContainsOnlyHex('1a3')).toBeTruthy();
    expect(StringRatchet.stringContainsOnlyHex('test')).toBeFalsy();
  });
});

describe('#stringCsvSafe', function () {
  it('should make values safe to place in a CSV"', function () {
    expect(StringRatchet.csvSafe('test')).toEqual('test');
    expect(StringRatchet.csvSafe('test,and 1')).toEqual('"test,and 1"');
    expect(StringRatchet.csvSafe(1)).toEqual('1');
    expect(StringRatchet.csvSafe("test'blah")).toEqual('"test\'blah"');
  });
});

describe('#trimToEmpty', function () {
  it('should return an empty string for null"', function () {
    const result: string = StringRatchet.trimToEmpty(null);
    expect(result).toEqual('');
  });

  it('should return an empty string for undefined"', function () {
    const result: string = StringRatchet.trimToEmpty(undefined);
    expect(result).toEqual('');
  });

  it('should return an empty string"', function () {
    const result: string = StringRatchet.trimToEmpty('     ');
    expect(result).toEqual('');
  });

  it('should return an abc"', function () {
    const result: string = StringRatchet.trimToEmpty('abc   ');
    expect(result).toEqual('abc');
  });

  it('should return string "5"', function () {
    const result: string = StringRatchet.trimToEmpty(5 as any); // as any to fool TSC for testing
    expect(result).toEqual('5');
  });
});

describe('#trimStringPropertiesInPlace', function () {
  it('should trim properties to null"', function () {
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

  it('should trim properties to empty"', function () {
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
