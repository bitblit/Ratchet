/*
    Functions for working with base64
*/

import { Logger } from './logger';

export class Base64Ratchet {
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
    return Base64Ratchet.generateBase64VersionOfBuffer(Buffer.from(input));
  }

  public static generateBase64VersionOfBuffer(input: Buffer): string {
    // Yeah, I know.  But it keeps you from having to remember how it works
    return input.toString('base64');
  }

  public static base64StringToBuffer(input: string): Buffer {
    return Buffer.from(input, 'base64');
  }

  public static base64StringToString(input: string, encoding = 'utf8'): string {
    return Buffer.from(input, 'base64').toString(encoding);
  }
}
