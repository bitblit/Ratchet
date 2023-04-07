import { $enum, EnumWrapper } from 'ts-enum-util';
import { StringRatchet } from './string-ratchet.js';

/**
 * This class is here because Typescript's enums aren't very good - they aren't typesafe, and are difficult
 * to go back-and-forth from strings, etc.  This also allows the HTTP layer to send a enum that isn't using the
 * same case as the enum and still handle it correctly.  Either way, it puts all the conversion login in one
 * place so if typescript changes this yet again in the future there'll be a convenient place to fix them
 * all at once
 */
export class EnumRatchet {
  public static listEnumKeys(enumeration: any): string[] {
    const rval: string[] = $enum(enumeration).getValues();
    return rval;
  }

  public static keyToEnum<T>(enumeration: any, val: string, caseSensitive: boolean = false): T {
    const e: EnumWrapper = $enum(enumeration);
    let rval: T = null;
    if (!!val) {
      rval = e.asValueOrDefault(val, null);
      if (!rval && !caseSensitive) {
        // Try other cases
        const keys: string[] = EnumRatchet.listEnumKeys(enumeration);
        const mKey: string = keys.find((k) => k.toUpperCase() === val.toUpperCase());
        if (!!mKey) {
          rval = e.asValueOrDefault(mKey, null);
        }
      }
    }
    return rval;
  }

  public static parseCsvToEnumArray<T>(enumeration: any, input: string): T[] {
    const split: string[] = StringRatchet.trimToEmpty(input)
      .split(',')
      .map((s) => s.trim());
    const rval: T[] = split.map((s) => EnumRatchet.keyToEnum<T>(enumeration, s)).filter((s) => !!s);
    return rval;
  }
}
