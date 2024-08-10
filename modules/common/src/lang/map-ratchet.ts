/*
    Functions for working with maps (dictionaries/objects in javascript)
*/

import { KeyValue } from './key-value.js';
import { Logger } from '../logger/logger.js';
import { ErrorRatchet } from './error-ratchet.js';

export class MapRatchet {
  // Takes any map with keys that are nested and expands them
  // eg, x['a.b']=2 becomes x['a']={b:2}
  // Renamed because the pre-v4 version deferred to lodash and handled arrays correctly.
  // This removes the lodash dependency, but isn't fully backward compatible
  public static expandNestedKeysToObjects<T>(src: any, separator = '.'): T {
    if (!separator || separator.length !== 1) {
      throw new Error('Invalid separator (must be single character)');
    }
    const rval: T = {} as T;
    Object.keys(src).forEach((k) => {
      const path: string[] = k.split(separator);
      let target: any = rval;
      while (path.length > 1) {
        target[path[0]] = target[path[0]] || {};
        target = target[path[0]];
        path.splice(0, 1);
      }
      target[path[0]] = src[k];
    });
    return rval;
  }

  public static mapByUniqueProperty<T, R>(input: T[], propName: string): Map<R, T> {
    if (!input || !propName) {
      throw new Error('Neither input nor propName can be null');
    }

    const rval: Map<R, T> = new Map<R, T>();
    input.forEach((i) => {
      const val: R = i ? i[propName] : null;
      if (val === null || val === undefined) {
        throw new Error('No value for ' + propName + ' found in ' + JSON.stringify(i));
      }
      if (rval.has(val)) {
        throw new Error('Multiple values found for ' + val);
      }
      rval.set(val, i);
    });
    return rval;
  }

  public static groupByProperty<T, R>(input: T[], propName: string): Map<R, T[]> {
    if (!input || !propName) {
      throw new Error('Neither input nor propName can be null');
    }

    const rval: Map<R, T[]> = new Map<R, T[]>();
    input.forEach((i) => {
      const val: R = i ? i[propName] : null;
      if (val === null || val === undefined) {
        throw ErrorRatchet.fErr('No value for %s found in %j', propName, i);
      }
      if (!rval.has(val)) {
        rval.set(val, []);
      }
      rval.get(val).push(i);
    });
    return rval;
  }

   
  public static findValue(toSearch: any, path: string[]): any {
    if (!path || path.length == 0) {
      return toSearch;
    } else {
      if (toSearch) {
        return MapRatchet.findValue(toSearch[path[0]], path.slice(1));
      } else {
        return null;
      }
    }
  }

   
  public static findValueDotPath(toSearch: any, dotPath: string): any {
    if (!dotPath || dotPath.length == 0) {
      return toSearch;
    } else {
      if (toSearch) {
        return MapRatchet.findValue(toSearch, dotPath.split('.'));
      } else {
        return null;
      }
    }
  }

  // Ok so this does the dumbest possible deep compare, by converting
  // both objects to JSON and comparing strings.  Its slow and stupid
  // but its easy.
   
  public static simpleDeepCompare(object1: any, object2: any): boolean {
    if (object1 == null && object2 == null) return true;
    if (object1 == null || object2 == null) return false;
    return JSON.stringify(object1) == JSON.stringify(object2);
  }

   
  public static toKeyValueList(value: Record<string, any>): KeyValue<any>[] {
    const returnArray: KeyValue<any>[] = [];

    for (const k of Object.keys(value)) {
      returnArray.push({
        key: k,
        value: value[k],
      } as KeyValue<any>);
    }

    return returnArray;
  }

  public static fromKeyValueList<T>(list: KeyValue<T>[]): Record<string, T> {
    const rval: any = {};
    list.forEach((a) => (rval[a.key] = a.value));
    return rval;
  }

  /*
    Mainly here to simplify sending objects to DynamoDB - recursively descend and clean up javascript objects, removing
    any empty strings, nulls, etc.

    CAW 2024-08-09: Since DynamoClient has its own implementation of this now, better to use the marshaller over there instead
     */
  public static cleanup<T>(obj: T, stripZero = false, stripNull = true, stripUndefined = true, stripEmptyString = true): T {
    // See : https://stackoverflow.com/questions/286141/remove-blank-attributes-from-an-object-in-javascript
    if (obj === null || obj === undefined || typeof obj !== 'object') {
      return obj;
    }
    const o = JSON.parse(JSON.stringify(obj)); // Clone source oect.

    Object.keys(o).forEach((key) => {
      if (o[key] && typeof o[key] === 'object') {
        if (Array.isArray(o[key])) {
          for (let i = 0; i < o[key].length; i++) {
            o[key][i] = MapRatchet.cleanup(o[key][i]);
          }
        } else {
          o[key] = MapRatchet.cleanup(o[key]); // Recurse.
        }
      } else if (
        (o[key] === undefined && stripUndefined) ||
        (o[key] === null && stripNull) ||
        (o[key] === '' && stripEmptyString) ||
        (o[key] === 0 && stripZero)
      ) {
        // This actually IS a bad example of this, but the whole function is deprecated now
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete o[key]; // Delete undefined and null.
      } else {
        // Leave it alone
      }
    });

    return o; // Return new object.
  }

   
  public static extractValueFromMapIgnoreCase(src: any, key: string): any {
    let rval: any = null;
    if (src && key) {
      const finder: string = key.toLowerCase();
      Object.keys(src).forEach((s) => {
        if (s.toLowerCase() === finder) {
          const newVal: string = src[s];
          if (rval) {
            Logger.warn('Multiple entries found for %s (replacing %s with %s', key, rval, newVal);
          }
          rval = newVal;
        }
      });
    }
    return rval;
  }

   
  public static safeCallFunction(ob: any, fnName: string): boolean {
    let rval = false;
    if (!!ob && !!ob[fnName] && typeof ob[fnName] === 'function') {
      try {
        ob[fnName]();
        rval = true;
      } catch (err) {
        Logger.warn('Error calling %s on %s : %s', fnName, ob, err, err);
      }
    }
    return rval;
  }

   
  public static caseInsensitiveAccess<T>(ob: any, keyName: string): T {
    let rval: T = null;

    if (!!ob && !!keyName) {
      rval = ob[keyName]; // Short circuit
      if (!rval) {
        const keyNameCI: string = Object.keys(ob).find((f) => f.toLowerCase() === keyName.toLowerCase());
        if (keyNameCI) {
          rval = ob[keyNameCI];
        }
      }
    }
    return rval;
  }
}
