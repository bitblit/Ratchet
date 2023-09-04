import { Base64Ratchet } from './base64-ratchet';

describe('#base64', function () {
  it('should parse a Uint8Array from base64', function () {
    const result: Uint8Array = Base64Ratchet.base64StringToUint8Array('dGVzdHVzZXI6dGVzdHBhc3M=');
    expect(result).toBeTruthy();
    expect(result.length).toEqual(17);
  });

  it('should parse a string from base64', function () {
    const result: string = Base64Ratchet.base64StringToString('dGVzdHVzZXI6dGVzdHBhc3M=');
    expect(result).toBeTruthy();
    expect(result.length).toEqual(17);
  });

  it('should round-trip a string', function () {
    const testString: string = 'teststring';
    const enc: string = Base64Ratchet.generateBase64VersionOfString(testString);
    const result: string = Base64Ratchet.base64StringToString(enc);
    expect(result).toBeTruthy();
    expect(result).toEqual(testString);
  });

  it('should round-trip an object', function () {
    const testOb: any = { a: 'teststring', b: 27 };
    const enc: string = Base64Ratchet.safeObjectToBase64JSON(testOb);
    const result: any = Base64Ratchet.safeBase64JSONParse(enc);
    expect(result).toBeTruthy();
    expect(result.a).toEqual(testOb.a);
    expect(result.b).toEqual(testOb.b);
  });
});
