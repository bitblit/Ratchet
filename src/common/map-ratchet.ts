
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


}

