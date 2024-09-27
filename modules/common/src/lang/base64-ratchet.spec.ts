import { Base64Ratchet } from './base64-ratchet.js';
import { expect, test, describe } from 'vitest';

describe('#base64', function () {
  test('should parse a Uint8Array from base64', function () {
    const result: Uint8Array = Base64Ratchet.base64StringToUint8Array('dGVzdHVzZXI6dGVzdHBhc3M=');
    expect(result).toBeTruthy();
    expect(result.length).toEqual(17);
  });

  test('should parse a string from base64', function () {
    const result: string = Base64Ratchet.base64StringToString('dGVzdHVzZXI6dGVzdHBhc3M=');
    expect(result).toBeTruthy();
    expect(result.length).toEqual(17);
  });

  test('should round-trip a string', function () {
    const testString = 'teststring';
    const enc: string = Base64Ratchet.generateBase64VersionOfString(testString);
    const result: string = Base64Ratchet.base64StringToString(enc);
    expect(result).toBeTruthy();
    expect(result).toEqual(testString);
  });

  test('should round-trip an object', function () {
    const testOb: any = { a: 'teststring', b: 27 };
    const enc: string = Base64Ratchet.safeObjectToBase64JSON(testOb);
    const result: any = Base64Ratchet.safeBase64JSONParse(enc);
    expect(result).toBeTruthy();
    expect(result.a).toEqual(testOb.a);
    expect(result.b).toEqual(testOb.b);
  });

  test('should work on special characters', function () {
    const src = '✓ à la mode';
    const b64: string = Base64Ratchet.generateBase64VersionOfString(src);
    const back: string = Base64Ratchet.base64StringToString(b64);
    expect(b64).toEqual('4pyTIMOgIGxhIG1vZGU=');
    expect(back).toEqual(src);
  });

  test('should work on arbitrary data', function () {
    const srcB64 = '7zo_JDdubAcOMnLtkoth_rLRc6Zj5RKRpNGv_nTVYY4';
    const back: Uint8Array = Base64Ratchet.base64UrlStringToBytes(srcB64);
    expect(back).toBeTruthy();
    expect(back.length).toEqual(32);
  });
});
