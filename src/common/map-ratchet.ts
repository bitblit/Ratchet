
/*
    Functions for working with maps (dictionaries/objects in javascript)
*/

import {KeyValue} from './key-value';

export class MapRatchet {

    public static findValue(toSearch: any, path:string[]) : any
    {
        if (!path || path.length==0)
        {
            return toSearch;
        }
        else
        {
            if (toSearch)
            {
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

    public static fromKeyValueList(list:KeyValue[]):any {
        let rval : any = {};
        list.forEach(a=>rval[a.key]=a.value);
        return rval;
    }

}

