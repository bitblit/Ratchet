import { expect } from 'chai';
import { BooleanRatchet } from '../../src/common/boolean-ratchet';

describe('#parseBool', function () {
  it('should parse the string true as true', function () {
    const result = BooleanRatchet.parseBool('true');
    expect(result).to.equal(true);
  });

  it('should parse the string TRUE as true', function () {
    const result = BooleanRatchet.parseBool('TRUE');
    expect(result).to.equal(true);
  });

  it('should parse the boolean true as true', function () {
    const result = BooleanRatchet.parseBool(true);
    expect(result).to.equal(true);
  });

  it('should parse the empty string as false', function () {
    const result = BooleanRatchet.parseBool('');
    expect(result).to.equal(false);
  });

  it('should parse null as false', function () {
    const result = BooleanRatchet.parseBool(null);
    expect(result).to.equal(false);
  });

  it('should parse "asdf" as false', function () {
    const result = BooleanRatchet.parseBool('asdf');
    expect(result).to.equal(false);
  });
});

describe('#intToBool', function () {
  it('should parse null as false', function () {
    const result = BooleanRatchet.intToBool(null);
    expect(result).to.equal(false);
  });

  it('should parse 0 as false', function () {
    const result = BooleanRatchet.intToBool(0);
    expect(result).to.equal(false);
  });

  it('should parse "0" as false', function () {
    const result = BooleanRatchet.intToBool('0');
    expect(result).to.equal(false);
  });

  it('should parse 1 as true', function () {
    const result = BooleanRatchet.intToBool(1);
    expect(result).to.equal(true);
  });

  it('should parse "1" as true', function () {
    const result = BooleanRatchet.intToBool('1');
    expect(result).to.equal(true);
  });

  it('should parse "2" as true', function () {
    const result = BooleanRatchet.intToBool('2');
    expect(result).to.equal(true);
  });
});
