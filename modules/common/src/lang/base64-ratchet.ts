/*
    Functions for working with base64
*/

import { Logger } from '../logger/logger.js';
import { StringRatchet } from './string-ratchet.js';
import { ErrorRatchet } from './error-ratchet.js';

// We use uint8 arrays in here because the default javascript handling of base64 encoding/decoding is
// broken for anything that isn't a normal ascii string

// Base64 code in this class lifted straight from:
// https://gist.githubusercontent.com/enepomnyaschih/72c423f727d395eeaa09697058238727/raw/74d3cbf82481545bc26c104de2419f4ee30c7dd7/base64.js
// Since native javascript handling is so poor
export class Base64Ratchet {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public static safeObjectToBase64JSON(input: any): any {
    return !!input ? Base64Ratchet.generateBase64VersionOfString(JSON.stringify(input)) : null;
  }

  public static safeBase64JSONParse(input: string): any {
    let rval: any = {};
    try {
      if (input) {
        rval = JSON.parse(Base64Ratchet.base64StringToString(input, 'utf-8'));
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
    return Base64Ratchet.generateBase64VersionOfUint8Array(StringRatchet.stringToUint8Array(input));
  }

  public static generateBase64VersionOfUint8Array(input: Uint8Array): string {
    return Base64Ratchet.uint8ArrayToBase64String(input);
  }

  public static base64StringToUint8Array(b64encoded: string): Uint8Array {
    try {
      const uint8: Uint8Array = Base64Ratchet.base64StringToBytes(b64encoded);
      return uint8;
    } catch (err) {
      Logger.error('Failed to decode base64: %s', b64encoded);
      throw err;
    }
  }

  public static base64StringToString(input: string, encoding: string = 'utf8'): string {
    return new TextDecoder(encoding).decode(Base64Ratchet.base64StringToUint8Array(input));
  }

  private static BASE64_ABC: string[] = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '+',
    '/',
  ];

  /*
  // This constant can also be computed with the following algorithm:
  const l = 256, base64codes = new Uint8Array(l);
  for (let i = 0; i < l; ++i) {
      base64codes[i] = 255; // invalid character
  }
  base64abc.forEach((char, index) => {
      base64codes[char.charCodeAt(0)] = index;
  });
  base64codes["=".charCodeAt(0)] = 0; // ignored anyway, so we just need to prevent an error
  */
  private static BASE64_CODES: number[] = [
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 62, 255, 255, 255, 63, 52, 53, 54, 55, 56, 57, 58, 59,
    60, 61, 255, 255, 255, 0, 255, 255, 255, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
    255, 255, 255, 255, 255, 255, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51,
  ];

  public static getBase64Code(charCode: number): number {
    if (charCode >= Base64Ratchet.BASE64_CODES.length) {
      throw new Error('Unable to parse base64 string.');
    }
    const code: number = Base64Ratchet.BASE64_CODES[charCode];
    if (code === 255) {
      throw new Error('Unable to parse base64 string.');
    }
    return code;
  }

  public static uint8ArrayToBase64String(bytes: Uint8Array): string {
    let result: string = '';
    let i: number;
    const l: number = bytes.length;
    for (i = 2; i < l; i += 3) {
      result += Base64Ratchet.BASE64_ABC[bytes[i - 2] >> 2];
      result += Base64Ratchet.BASE64_ABC[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
      result += Base64Ratchet.BASE64_ABC[((bytes[i - 1] & 0x0f) << 2) | (bytes[i] >> 6)];
      result += Base64Ratchet.BASE64_ABC[bytes[i] & 0x3f];
    }
    if (i === l + 1) {
      // 1 octet yet to write
      result += Base64Ratchet.BASE64_ABC[bytes[i - 2] >> 2];
      result += Base64Ratchet.BASE64_ABC[(bytes[i - 2] & 0x03) << 4];
      result += '==';
    }
    if (i === l) {
      // 2 octets yet to write
      result += Base64Ratchet.BASE64_ABC[bytes[i - 2] >> 2];
      result += Base64Ratchet.BASE64_ABC[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
      result += Base64Ratchet.BASE64_ABC[(bytes[i - 1] & 0x0f) << 2];
      result += '=';
    }
    return result;
  }

  public static base64StringToBytes(str: string): Uint8Array {
    if (str.length % 4 !== 0) {
      throw ErrorRatchet.fErr('Unable to parse base64 string, length: %s', str.length);
    }
    const index = str.indexOf('=');
    if (index !== -1 && index < str.length - 2) {
      throw ErrorRatchet.fErr('Unable to parse base64 string, index %s', index);
    }
    const missingOctets: number = str.endsWith('==') ? 2 : str.endsWith('=') ? 1 : 0;
    const n: number = str.length;
    const result: Uint8Array = new Uint8Array(3 * (n / 4));
    let buffer;
    for (let i = 0, j = 0; i < n; i += 4, j += 3) {
      buffer =
        (Base64Ratchet.getBase64Code(str.charCodeAt(i)) << 18) |
        (Base64Ratchet.getBase64Code(str.charCodeAt(i + 1)) << 12) |
        (Base64Ratchet.getBase64Code(str.charCodeAt(i + 2)) << 6) |
        Base64Ratchet.getBase64Code(str.charCodeAt(i + 3));
      result[j] = buffer >> 16;
      result[j + 1] = (buffer >> 8) & 0xff;
      result[j + 2] = buffer & 0xff;
    }
    return result.subarray(0, result.length - missingOctets);
  }

  public static encodeStringToBase64String(str: string, encoder = new TextEncoder()): string {
    return Base64Ratchet.uint8ArrayToBase64String(encoder.encode(str));
  }

  public static decodeBase64StringToString(str: string, decoder = new TextDecoder()): string {
    return decoder.decode(Base64Ratchet.base64StringToBytes(str));
  }
}
