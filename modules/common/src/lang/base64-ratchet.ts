/*
    Functions for working with base64
*/

import { Logger } from '../logger/logger.js';
import { Base64 } from 'js-base64';

export class Base64Ratchet {
  private static UTF8_ENCODER: TextEncoder = new TextEncoder();
  private static UTF8_DECODER: TextDecoder = new TextDecoder('utf-8');

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public static safeObjectToBase64JSON(input: any): any {
    return !!input ? Base64Ratchet.generateBase64VersionOfString(JSON.stringify(input)) : null;
  }

  public static safeBase64JSONParse(input: string): any {
    let rval: any = {};
    try {
      if (input) {
        rval = JSON.parse(Base64Ratchet.base64StringToString(input));
      }
    } catch (err) {
      Logger.warn('Error parsing b64/json : %s as json, got %s', input, err, err);
      rval = {};
    }
    return rval;
  }

  public static generateBase64VersionOfBlob(blob: Blob): Promise<string> {
    return new Promise(function (resolve, reject) {
      if (!blob || blob.size == 0) {
        reject('Wont convert null or non-blob or empty blob');
      } else {
        const reader = new FileReader();
        reader.onloadend = function () {
          resolve(reader.result.toString());
        };
        reader.readAsDataURL(blob);
      }
    });
  }

  public static generateBase64VersionOfString(input: string): string {
    return Base64Ratchet.generateBase64VersionOfUint8Array(Base64Ratchet.UTF8_ENCODER.encode(input));
  }

  public static generateBase64VersionOfUint8Array(input: Uint8Array): string {
    // Using btoa even though its deprecated because its supported both in Node and Web
    return Base64.btoa(Base64Ratchet.UTF8_DECODER.decode(input));
  }

  public static base64StringToUint8Array(b64encoded: string): Uint8Array {
    return new Uint8Array(
      Base64.atob(b64encoded)
        .split('')
        .map(function (c) {
          return c.charCodeAt(0);
        }),
    );
  }

  public static base64StringToString(input: string, encoding: string = 'utf8'): string {
    return new TextDecoder(encoding).decode(Base64Ratchet.base64StringToUint8Array(input));
  }
}
