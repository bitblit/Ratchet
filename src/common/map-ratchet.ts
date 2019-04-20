/*
    Functions for working with maps (dictionaries/objects in javascript)
*/

import {KeyValue} from './key-value';
import {Logger} from './logger';

export class MapRatchet {

    public static mapByUniqueProperty<T,R>(input: T[], propName: string): Map<R,T> {
        if (!input || !propName) {
            throw new Error('Neither input nor propName can be null');
        }

        const rval: Map<R, T> = new Map<R, T>();
        input.forEach(i => {
            const val: R = (!!i) ? i[propName] : null;
            if (!val) {
                throw new Error('No value for ' + propName + ' found in ' + JSON.stringify(i));
            }
            if (rval.has(val)) {
                throw new Error('Multiple values found for ' + val);
            }
            rval.set(val, i);
        })
        return rval;
    }

    public static findValue(toSearch: any, path: string[]): any {
        if (!path || path.length == 0) {
            return toSearch;
        }
        else {
            if (toSearch) {
                return MapRatchet.findValue(toSearch[path[0]], path.slice(1));
            }
            else {
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

    public static toKeyValueList(value: any): KeyValue[] {
        let returnArray: KeyValue[] = [];

        for (let k of Object.keys(value)) {
            returnArray.push({
                key: k,
                value: value[k]
            } as KeyValue);
        }

        return returnArray;
    }

    public static fromKeyValueList(list: KeyValue[]): any {
        let rval: any = {};
        list.forEach(a => rval[a.key] = a.value);
        return rval;
    }

    /*
    Mainly here to simplify sending objects to DynamoDB - recursively descend and clean up javascript objects, removing
    any empty strings, nulls, etc
     */
    public static cleanup<T>(obj: T, stripZero: boolean = false, stripNull: boolean = true, stripUndefined: boolean = true, stripEmptyString: boolean = true
    ): T {
        // See : https://stackoverflow.com/questions/286141/remove-blank-attributes-from-an-object-in-javascript
        if (obj === null || obj === undefined || typeof obj !== 'object') {
            return obj;
        }
        const o = JSON.parse(JSON.stringify(obj)); // Clone source oect.

        Object.keys(o).forEach(key => {
            if (o[key] && typeof o[key] === 'object') {
                if (Array.isArray(o[key])) {
                    for (let i = 0; i < o[key].length; i++) {
                        o[key][i] = MapRatchet.cleanup(o[key][i]);
                    }
                } else {
                    o[key] = MapRatchet.cleanup(o[key]);  // Recurse.
                }
            } else if ((o[key] === undefined && stripUndefined) ||
                (o[key] === null && stripNull) ||
                (o[key] === '' && stripEmptyString) ||
                (o[key] === 0 && stripZero)) {
                delete o[key]; // Delete undefined and null.
            } else {
                o[key] = o[key];  // Copy value.
            }
        });

        return o; // Return new object.
    }


    public static extractValueFromMapIgnoreCase(src: any, key: string): any {
        let rval: any = null;
        if (src && key) {
            const finder: string = key.toLowerCase();
            Object.keys(src).forEach(s => {
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


    public static safeCallFunction(ob:any, fnName: string): boolean {
        let rval: boolean = false;
        if (!!ob && !!ob[fnName] && typeof ob[fnName]==='function') {
            try {
                ob[fnName]();
                rval = true;
            } catch (err) {
                Logger.warn('Error calling %s on %s : %s', fnName, ob, err, err);
            }
        }
        return rval;
    }


}

