
/*
    Functions for working with maps (dictionaries/objects in javascript)
*/

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

}

