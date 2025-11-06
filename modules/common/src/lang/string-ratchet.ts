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

  /**
   * Checks if the given input string contains only characters present in the provided alphabet.
   * @param input - The string to check.
   * @param alphabet - The set of allowed characters.
   * @returns True if the string contains only characters from the alphabet, otherwise false.
   */
  public static stringIsInGivenAlphabet(input: string, alphabet: string): boolean {
    let rval = false;
    if (input && alphabet) {
      for (let i = 0; i < input.length && !rval; i++) {
        rval = alphabet.includes(input.charAt(i));
      }
    }
    return rval;
  }

  /**
   * Converts a string to a Uint8Array using TextEncoder.
   * @param val - The input string.
   * @returns Uint8Array representing the input string, or null if input is falsy.
   */
  public static stringToUint8Array(val: string): Uint8Array<ArrayBuffer> {
    return val ? new TextEncoder().encode(val) : null;
  }

  /**
   * Decodes a Uint8Array into a string using TextDecoder.
   * @param val - The input Uint8Array.
   * @returns The decoded string, or null if input is falsy.
   */
  public static uint8ArrayToString(val: Uint8Array): string {
    return val ? new TextDecoder().decode(val) : null;
  }

  /**
   * Attempts to parse a string as JSON.
   *
   *  Really only useful if you wanna swallow the exception when something is
   *  not valid JSON (or at least not parseable as JSON - the spec says 'true'
   *  or '2' are not technically valid JSON strings)
   *
   * @param val - The input string.
   * @returns The parsed JSON object, or null if parsing fails.
   */
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

  /**
   * Checks if a string can be parsed as JSON.
   * @param val - The input string.
   * @returns True if parsing succeeds, otherwise false.
   */
  public static canParseAsJson(val: string): boolean {
    return !!StringRatchet.attemptJsonParse(val);
  }

  /**
   * Determines if all characters in the string are unique.
   * @param input - The input string.
   * @returns True if all characters are unique, false otherwise.
   */
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

  /**
   * Generates all permutations of a given length using the provided alphabet.
   * @param len - The length of each permutation.
   * @param alphabet - A string containing unique characters to use.
   * @returns Array of permutation strings.
   */
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

  /**
   * Breaks a string into blocks of specified size separated by the given separator.
   * @param input - The input string.
   * @param blockSize - Size of each block.
   * @param separator - The separator to use between blocks.
   * @returns The formatted string.
   */
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

  /**
   * Creates a short unique identifier based on the current time and randomness.
   * @param blockSize - Optional block size to format the UID.
   * @param uniquesPerSecond - Unique numbers per second.
   * @param radix - The radix to convert the number.
   * @returns The generated unique identifier.
   */
  public static createShortUid(blockSize = 0, uniquesPerSecond = 1000, radix = 36): string {
    const currentEpoch: number = Math.floor(Date.now() / 1000);
    const asDecimal: number = parseInt(String(Math.floor(Math.random() * uniquesPerSecond)) + String(currentEpoch));
    const asHex: string = asDecimal.toString(radix);
    const out: string = blockSize > 0 ? StringRatchet.breakIntoBlocks(asHex, blockSize, '-') : asHex;
    return out;
  }

  /**
   * Generates a version 4 GUID.
   * @returns A GUID string.
   */
  public static createType4Guid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Generates a random string of a specified length from the given alphabet.
   * @param alphabet - The set of characters to use.
   * @param len - Desired length of the random string.
   * @returns The generated random string.
   */
  public static createRandomStringFromAlphabet(alphabet: string, len:number = 10): string {
    RequireRatchet.notNullUndefinedOrOnlyWhitespaceString(alphabet, 'Alphabet may not be empty');
    let rval: string = '';

    while (rval.length < len) {
      rval += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    return rval;

  }

  /**
   * Generates a random hexadecimal string of specified length.
   * @param len - Desired length of the hex string.
   * @returns The generated hex string.
   */
  public static createRandomHexString(len = 10): string {
    let r = '';
    for (let i = 0; i < len; i++) {
      r += Math.floor(Math.random() * 16).toString(16);
    }
    return r;
  }

  /**
   * Canonicalizes a string by lowering case, replacing spaces with dashes, and removing reserved characters.
   * @param value - The input string.
   * @returns The canonicalized string.
   */
  public static canonicalize(value: string): string {
    let rval = value ? value.toLowerCase() : '';

    rval = rval.replace(' ', '-');
    StringRatchet.RFC_3986_RESERVED.forEach((s) => {
      rval = rval.replace(s, '');
    });

    return rval;
  }

  /**
   * Formats a number of bytes into a human-readable string.
   * Taken from https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
   * @param bytes - The number of bytes.
   * @param decimals - Number of decimal places.
   * @returns A formatted string representing the size.
   */
  public static formatBytes(bytes: number, decimals = 2): string {
    if (bytes == 0) return '0 Bytes';
    const k = 1024,
      dm = decimals || 2,
      sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
      i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * Converts any input to a string representation regardless of type.
   * @param input - The input value.
   * @returns The string representation of the input.
   */
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

  /**
   * Determines if a string contains only whitespace characters.
   * @param input - The input string.
   * @returns True if the string contains only whitespace, false otherwise.
   */
  public static stringContainsOnlyWhitespace(input: string): boolean {
    return StringRatchet.stringContainsOnly(input, StringRatchet.WHITESPACE);
  }

  /**
   * Checks if the string contains only numeric characters.
   * @param input - The input string.
   * @returns True if the string consists solely of digits, otherwise false.
   */
  public static stringContainsOnlyNumbers(input: string): boolean {
    const rval: boolean = /^[0-9]+$/.test(input);
    return rval;
  }

  /**
   * Checks if the string contains only alphanumeric characters.
   * @param input - The input string.
   * @returns True if the string is alphanumeric, otherwise false.
   */
  public static stringContainsOnlyAlphanumeric(input: string): boolean {
    const rval: boolean = /^[0-9a-zA-Z]+$/.test(input);
    return rval;
  }
  /**
   * Checks if the string contains only hexadecimal characters.
   * @param input - The input string.
   * @returns True if the string is hexadecimal, otherwise false.
   */
  public static stringContainsOnlyHex(input: string): boolean {
    const rval: boolean = /^[0-9a-fA-F]+$/.test(input);
    return rval;
  }
  /**
   * Checks if the string contains only characters found in the provided validChars.
   * @param inVal - The input string.
   * @param validCharsIn - A string of valid characters.
   * @returns True if all characters in inVal are within validCharsIn, otherwise false.
   */
  public static stringContainsOnly(inVal: string, validCharsIn: string): boolean {
    const input: string = !inVal ? '' : inVal;
    const validChars: string = !validCharsIn ? '' : validCharsIn;
    let rval = true;

    for (let i = 0; i < input.length && rval; i++) {
      rval = validChars.indexOf(input.charAt(i)) >= 0;
    }
    return rval;
  }

  /**
   * Obscures a string by replacing its middle characters with asterisks.
   * @param input - The string to obscure.
   * @param prefixLength - Number of characters to leave unmasked at the start.
   * @param suffixLength - Number of characters to leave unmasked at the end.
   * @returns The obscured string.
   */
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

  /**
   * Pads a number with leading zeros to ensure a fixed length.
   * @param inVal - The number or value to pad.
   * @param size - The desired total length of the resulting string.
   * @returns The padded string.
   */
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

  /**
   * Trims whitespace from a string and returns an empty string if input is null.
   * @param input - The input string.
   * @returns A trimmed string or empty string.
   */
  public static trimToEmpty(input: string): string {
    const t: string = input ? StringRatchet.safeString(input) : '';
    return t.trim();
  }

  /**
   * Trims whitespace from a string and returns null if the result is empty.
   * @param input - The input string.
   * @returns A trimmed string or null if empty.
   */
  public static trimToNull(input: string): string {
    const x: string = StringRatchet.trimToEmpty(input);
    return x.length > 0 ? x : null;
  }

  /**
   * Trims all string properties in the provided object, setting properties that contain only whitespace to null.
   * @param input - The object whose string properties should be trimmed.
   * @returns The modified object with trimmed string properties.
   */
  public static trimAllStringPropertiesToNullInPlace<T>(input: T): T {
    return StringRatchet.trimAllStringPropertiesInPlace(input, false);
  }

  /**
   * Trims all string properties in the provided object, setting properties that contain only whitespace to an empty string.
   * @param input - The object whose string properties should be trimmed.
   * @returns The modified object with trimmed string properties.
   */
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

  /**
   * Removes all non-numeric characters from the input string.
   * @param input - The input string.
   * @returns A string consisting only of numeric characters (and an optional leading '-' sign).
   */
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

  /**
   * Formats a value into a CSV-safe string by quoting if necessary and escaping quotes.
   * @param input - The value to format.
   * @returns A CSV-safe string.
   */
  public static csvSafe(input: any): string {
    let rval: string = StringRatchet.trimToEmpty(StringRatchet.safeString(input));
    rval.split('"').join('\\"');
    if (rval.indexOf(',') !== -1 || rval.indexOf('"') !== -1 || rval.indexOf("'") !== -1) {
      rval = '"' + rval + '"';
    }
    return rval;
  }

  // Zach
  /**
   * Removes non-ASCII characters from a string.
   * @param value - The input string.
   * @returns A string containing only ASCII characters.
   */
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

  /**
   * Replaces all occurrences of a substring with another substring.
   * @param value - The original string.
   * @param src - The substring to replace.
   * @param dst - The replacement substring.
   * @returns The modified string.
   */
  public static replaceAll(value: string, src: string, dst: string): string {
    let rval: string = value;
    if (rval?.length && src?.length && dst?.length) {
      rval = rval.split(src).join(dst);
    }
    return rval;
  }

  /**
   * Performs a simple template fill on the provided string.
   * Replaces placeholders in the form ${key} with corresponding values from the filler's object.
   * e.g., "This is ${value} output", where value=An, becomes "This is An output"
   * Very similar to what handlebars will do, or for that matter, what
   * JavaScript will do natively with backticks, but typesafe and can
   * be passed around.  Default template style is ${value} to match JS backticks
   * @param template - The template string containing placeholders.
   * @param fillers - An object with keys corresponding to placeholders in the template.
   * @param errorOnMissingFiller - If true, throws an error if any placeholder is not provided a value.
   * @param opener - The opening delimiter for a placeholder.
   * @param closer - The closing delimiter for a placeholder.
   * @returns The template string with placeholders replaced by their corresponding values.
   */
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

  /**
   * Safely JSON stringifies an input, handling circular references gracefully.
   * @param input - The input value to stringify.
   * @returns A JSON string representation of the input, or an error message if circular references are found.
   */
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
   * Formats a string using placeholders similar to "util.format" in Node.js.
   * Supported placeholders: %o for objects (must be arrays), %s for strings,
   * %d for numbers, %j for JSON.
   *
   * Here so that I don't need to bring in a polyfill.  It is lifted DIRECTLY
   * from https://github.com/tmpfs/format-util License is MIT, see
   * ReferencedLicences for details.
   * All credit is due to that author for actually writing this thing.
   * @param fmt - The format string.
   * @param args - Values to replace placeholders.
   * @returns The formatted string.
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

  /**
   * Helper function to compute the length of the suffix that repeats without overlap.
   * Detail: Finds the longest repeating and non-overlapping substring using memoization
   * Ripped from https://www.geeksforgeeks.org/longest-repeating-and-non-overlapping-substring/
   * With some updates added to show types
   * @param i - Starting index for first substring.
   * @param j - Starting index for second substring.
   * @param s - The input string.
   * @param memo - 2D memoization array to cache results.
   * @returns The length of the common suffix that does not overlap.
   */
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

  /**
   * Finds the longest non-overlapping repeating substring in the given string.
   * @param s - The input string.
   * @returns The longest repeating substring if found, otherwise null.
   */
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

  public static snakeCaseToCamelCase(str) {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

}
