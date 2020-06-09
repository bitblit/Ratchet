import { expect } from 'chai';
import { BooleanRatchet } from '../../src/common/boolean-ratchet';
import { Base64Ratchet } from '../../src/common/base64-ratchet';

describe('#base64', function () {
  it('should parse a buffer from base64', function () {
    const result: Buffer = Base64Ratchet.base64StringToBuffer('dGVzdHVzZXI6dGVzdHBhc3M=');
    expect(result).to.not.be.null;
    expect(result.length).to.eq(17);
  });

  it('should parse a string from base64', function () {
    const result: string = Base64Ratchet.base64StringToString('dGVzdHVzZXI6dGVzdHBhc3M=');
    expect(result).to.not.be.null;
    expect(result.length).to.eq(17);
  });

  it('should round-trip a string', function () {
    const testString: string = 'teststring';
    const enc: string = Base64Ratchet.generateBase64VersionOfString(testString);
    const result: string = Base64Ratchet.base64StringToString(enc);
    expect(result).to.not.be.null;
    expect(result).to.eq(testString);
  });

  it('should round-trip an object', function () {
    const testOb: any = { a: 'teststring', b: 27 };
    const enc: string = Base64Ratchet.safeObjectToBase64JSON(testOb);
    const result: any = Base64Ratchet.safeBase64JSONParse(enc);
    expect(result).to.not.be.null;
    expect(result.a).to.eq(testOb.a);
    expect(result.b).to.eq(testOb.b);
  });
});
