/*
    Functions for working with strings
*/

import { RequireRatchet } from './require-ratchet.js';

export class StringRatchet {
  // % isn't technically reserved, but it is still a pain in the butt
  public static readonly RFC_3986_RESERVED = [
    '!',
    '*',
    "'",
    '(',
    ')',
    ';',
    ':',
    '@',
    '&',
    '=',
    '+',
    '$',
    ',',
    '/',
    '?',
    '#',
    '[',
    ']',
    '%',
  ];

  public static readonly WHITESPACE: string = ' \n\t';
  public static readonly DIGITS: string = '0123456789';
  public static readonly HEXITS: string = StringRatchet.DIGITS + 'ABCDEF';
  public static readonly UPPER_CASE_LATIN: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  public static readonly LOWER_CASE_LATIN: string = 'abcdefghijklmnopqrstuvwxyz';
  public static readonly CASE_INSENSITIVE_LATIN: string = StringRatchet.UPPER_CASE_LATIN + StringRatchet.LOWER_CASE_LATIN;

  public static stringIsInGivenAlphabet(input: string, alphabet: string): boolean {
    let rval = false;
    if (input && alphabet) {
      for (let i = 0; i < input.length && !rval; i++) {
        rval = alphabet.includes(input.charAt(i));
      }
    }
    return rval;
  }

  public static stringToUint8Array(val: string): Uint8Array {
    return val ? new TextEncoder().encode(val) : null;
  }

  public static uint8ArrayToString(val: Uint8Array): string {
    return val ? new TextDecoder().decode(val) : null;
  }

  // Really only useful if you wanna swallow the exception when something is not valid JSON (or at least not
  // parseable as JSON - the spec says 'true' or '2' are not technically valid JSON strings
  public static attemptJsonParse(val: string): any {
    let rval: any = null;
    if (StringRatchet.trimToNull(val)) {
      try {
        rval = JSON.parse(val);
      } catch {
        //(err) {
        rval = null;
      }
    }
    return rval;
  }

  // For when you do not care about the response
  public static canParseAsJson(val: string): boolean {
    return !!StringRatchet.attemptJsonParse(val);
  }

  public static allUnique(input: string): boolean {
    let rval = true;
    if (input) {
      const check: Set<string> = new Set<string>();
      for (let i = 0; i < input.length && rval; i++) {
        const test: string = input.charAt(i);
        rval = !check.has(test);
        check.add(test);
      }
    }
    return rval;
  }

  public static allPermutationsOfLength(len: number, alphabet: string): string[] {
    const rval: string[] = [];
    if (len > 0 && alphabet && alphabet.length > 0) {
      RequireRatchet.true(StringRatchet.allUnique(alphabet), 'Alphabet must be unique');
      const step: string[] = len === 1 ? [''] : StringRatchet.allPermutationsOfLength(len - 1, alphabet);
      for (let i = 0; i < alphabet.length; i++) {
        step.forEach((s) => rval.push(alphabet.charAt(i) + s));
      }
    }
    return rval;
  }

  public static breakIntoBlocks(input: string, blockSize: number, separator: string): string {
    let out = '';
    while (input.length > blockSize) {
      out = separator + input.substring(input.length - blockSize) + out;
      input = input.substring(0, input.length - blockSize);
    }

    if (input.length > 0) {
      out = input + out;
    } else {
      out = out.substring(1); // strip the leading separator
    }
    return out;
  }

  public static createShortUid(blockSize = 0, uniquesPerSecond = 1000, radix = 36): string {
    const currentEpoch: number = Math.floor(Date.now() / 1000);
    const asDecimal: number = parseInt(String(Math.floor(Math.random() * uniquesPerSecond)) + String(currentEpoch));
    const asHex: string = asDecimal.toString(radix);
    const out: string = blockSize > 0 ? StringRatchet.breakIntoBlocks(asHex, blockSize, '-') : asHex;
    return out;
  }

  public static createType4Guid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  public static createRandomHexString(len = 10): string {
    let r = '';
    for (let i = 0; i < len; i++) {
      r += Math.floor(Math.random() * 16).toString(16);
    }
    return r;
  }

  public static canonicalize(value: string): string {
    let rval = value ? value.toLowerCase() : '';

    rval = rval.replace(' ', '-');
    StringRatchet.RFC_3986_RESERVED.forEach((s) => {
      rval = rval.replace(s, '');
    });

    return rval;
  }

  // Taken from https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
  public static formatBytes(bytes: number, decimals = 2): string {
    if (bytes == 0) return '0 Bytes';
    const k = 1024,
      dm = decimals || 2,
      sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
      i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  // Converts anything that isn't a string to a string

  public static safeString(input: any): string {
    let rval: string = null;
    if (input != null) {
      const type: string = typeof input;
      if (type == 'string') {
        rval = input;
      } else {
        rval = String(input);
      }
    }
    return rval;
  }

  public static stringContainsOnlyWhitespace(input: string): boolean {
    return StringRatchet.stringContainsOnly(input, StringRatchet.WHITESPACE);
  }
  public static stringContainsOnlyNumbers(input: string): boolean {
    const rval: boolean = /^[0-9]+$/.test(input);
    return rval;
  }
  public static stringContainsOnlyAlphanumeric(input: string): boolean {
    const rval: boolean = /^[0-9a-zA-Z]+$/.test(input);
    return rval;
  }
  public static stringContainsOnlyHex(input: string): boolean {
    const rval: boolean = /^[0-9a-fA-F]+$/.test(input);
    return rval;
  }
  public static stringContainsOnly(inVal: string, validCharsIn: string): boolean {
    const input: string = !inVal ? '' : inVal;
    const validChars: string = !validCharsIn ? '' : validCharsIn;
    let rval = true;

    for (let i = 0; i < input.length && rval; i++) {
      rval = validChars.indexOf(input.charAt(i)) >= 0;
    }
    return rval;
  }

  public static obscure(input: string, prefixLength = 2, suffixLength = 2): string {
    if (!input) {
      return input;
    }
    const len: number = input.length;
    let pl: number = prefixLength;
    let sl: number = suffixLength;

    while (len > 0 && len < pl + sl + 1) {
      pl = Math.max(0, pl - 1);
      sl = Math.max(0, sl - 1);
    }
    const rem = len - (pl + sl);

    let rval = '';
    rval += input.substring(0, pl);
    // Yeah, I know.  I'm in a rush here
    for (let i = 0; i < rem; i++) {
      rval += '*';
    }
    rval += input.substring(len - sl);
    return rval;
  }

  public static leadingZeros(inVal: any, size: number): string {
    const pad = '00000000000000000000000000000000000000000000000000';
    let negative = false;
    let sVal = String(inVal);
    if (sVal.startsWith('-')) {
      negative = true;
      sVal = sVal.substring(1);
    }

    if (size > pad.length) {
      throw new Error('Cannot format number that large');
    }

    let rval: string = (pad + sVal).slice(-1 * size);
    if (negative) {
      rval = '-' + rval;
    }
    return rval;
  }

  public static trimToEmpty(input: string): string {
    const t: string = input ? StringRatchet.safeString(input) : '';
    return t.trim();
  }

  public static trimToNull(input: string): string {
    const x: string = StringRatchet.trimToEmpty(input);
    return x.length > 0 ? x : null;
  }

  public static trimAllStringPropertiesToNullInPlace<T>(input: T): T {
    return StringRatchet.trimAllStringPropertiesInPlace(input, false);
  }

  public static trimAllStringPropertiesToEmptyInPlace<T>(input: T): T {
    return StringRatchet.trimAllStringPropertiesInPlace(input, true);
  }

  private static trimAllStringPropertiesInPlace<T>(input: T, toEmpty: boolean): T {
    const dealKeys = Object.keys(input);
    dealKeys.forEach((key) => {
      const val = input[key];
      if (val != null && typeof val === 'string') {
        input[key] = toEmpty ? StringRatchet.trimToEmpty(input[key]) : StringRatchet.trimToNull(input[key]);
      }
    });
    return input;
  }

  public static stripNonNumeric(input: string): string {
    let rval: string = input;
    if (input != null && !StringRatchet.stringContainsOnlyNumbers(input)) {
      // Im sure there is a better way
      rval = '';
      for (let i = 0; i < input.length; i++) {
        const c: string = input.charAt(i);
        if (StringRatchet.stringContainsOnlyNumbers(c) || (i === 0 && c === '-')) {
          rval += c;
        }
      }
    }

    return rval;
  }

  public static csvSafe(input: any): string {
    let rval: string = StringRatchet.trimToEmpty(StringRatchet.safeString(input));
    rval.split('"').join('\\"');
    if (rval.indexOf(',') !== -1 || rval.indexOf('"') !== -1 || rval.indexOf("'") !== -1) {
      rval = '"' + rval + '"';
    }
    return rval;
  }

  // Zach
  public static stripNonAscii(value: string): string {
    const reduced = [...value].reduce((previousValue: string, currentValue: string) => {
      const charCode: number = currentValue.charCodeAt(0);
      if (charCode > 127) {
        return previousValue;
      }
      return previousValue + currentValue;
    });
    return reduced;
  }

  public static replaceAll(value: string, src: string, dst: string): string {
    let rval: string = value;
    if (rval?.length && src?.length && dst?.length) {
      rval = rval.split(src).join(dst);
    }
    return rval;
  }

  // Performs simple template fills of the form
  // This is ${value} output, where value=A, becomes This is A output
  // Very similar to what handlebars will do, or for that matter what
  // javascript will do natively with backticks, but typesafe and can
  // be passed around.  Default template style is ${value} to match JS backticks
  // Note that any
  public static simpleTemplateFill(
    template: string,
    fillers: Record<string, any>,
    errorOnMissingFiller = false,
    opener = '${',
    closer = '}',
  ): string {
    let rval: string = template;
    if (rval && fillers) {
      Object.keys(fillers).forEach((key) => {
        rval = rval.split(opener + key + closer).join(fillers[key]);
      });
    }
    if (errorOnMissingFiller && rval?.indexOf(opener) >= 0) {
      throw new Error('Template has unfilled variables:' + rval);
    }
    return rval;
  }

  public static circSafeJsonStringify(input: any): string {
    let rval: string = null;
    try {
      rval = JSON.stringify(input);
    } catch (err) {
      if (err instanceof TypeError) {
        let lines: string[] = err.message
          .split('\n')
          .map((s) => StringRatchet.trimToNull(s))
          .filter((s) => !!s);
        lines = lines.filter((s) => s.startsWith('-->') || s.startsWith('---'));

        rval = 'Cannot stringify - object contains circular reference : ' + lines.join(', ');
      } else {
        throw err;
      }
    }
    return rval;
  }

  /**
   * So this is a straightforward replace of util.format from NodeJS
   * so that I don't need to bring in a polyfill.  It is lifted DIRECTLY
   * from https://github.com/tmpfs/format-util .  License is MIT, see
   * ReferencedLicences for details.
   * All credit is due to that author for actually writing this thing.
   * @param fmt String format to fill
   * @param args any arguments to fill the format
   */
  public static format(fmt: string, ...args: any[]): string {
    const re: RegExp = /(%?)(%([ojds]))/g;
    if (args.length) {
      fmt = fmt.replace(re, function (match, escaped, ptn, flag) {
        let arg = args.shift();
        switch (flag) {
          case 'o':
            if (Array.isArray(arg)) {
              arg = StringRatchet.circSafeJsonStringify(arg);
              break;
            } else {
              throw new Error('Cannot use o placeholder for argument of type ' + typeof arg);
            }
          case 's':
            arg = '' + arg;
            break;
          case 'd':
            arg = Number(arg);
            break;
          case 'j':
            arg = StringRatchet.circSafeJsonStringify(arg);
            break;
        }
        if (!escaped) {
          return arg;
        }
        args.unshift(arg);
        return match;
      });
    }

    // arguments remain after formatting
    if (args.length) {
      fmt += ' ' + args.join(' ');
    }

    // update escaped %% values
    fmt = fmt.replace(/%{2,2}/g, '%');

    return '' + fmt;
  }

  // JavaScript program to find longest repeating
  // and non-overlapping substring using memoization
  // Ripped from https://www.geeksforgeeks.org/longest-repeating-and-non-overlapping-substring/
  // Some updates added to show types
  public static findSuffix(i: number, j: number, s: string, memo: number[][]) {
    // base case
    if (j === s.length) return 0;

    // return memoized value
    if (memo[i][j] !== -1) return memo[i][j];

    // if characters match
    if (s[i] === s[j]) {
      memo[i][j] = 1 + Math.min(StringRatchet.findSuffix(i + 1, j + 1, s, memo), j - i - 1);
    } else {
      memo[i][j] = 0;
    }

    return memo[i][j];
  }

  public static longestNonOverlappingRepeatingSubstring(s: string): string | null {
    const n: number = s.length;

    const memo: number[][] = Array.from({ length: n }, () => Array(n).fill(-1));

    // find length of non-overlapping
    // substrings for all pairs (i, j)
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        StringRatchet.findSuffix(i, j, s, memo);
      }
    }

    let ans = '';
    let ansLen = 0;

    // If length of suffix is greater
    // than ansLen, update ans and ansLen
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (memo[i][j] > ansLen) {
          ansLen = memo[i][j];
          ans = s.substring(i, i + ansLen);
        }
      }
    }

    return ansLen > 0 ? ans : null;
  }
}
