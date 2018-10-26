/*
    Functions for working with booleans
*/

export class BooleanRatchet {

    public static parseBool(val: any): boolean {
        return val === true || (val != null && typeof val === 'string' && val.toLowerCase() === 'true');
    }

}

