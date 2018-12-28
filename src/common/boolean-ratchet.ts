/*
    Functions for working with booleans
*/

import {NumberRatchet} from './number-ratchet';

export class BooleanRatchet {

    public static parseBool(val: any): boolean {
        return val === true || (val !== null && val !== undefined && typeof val === 'string' && val.toLowerCase() === 'true');
    }

    public static intToBool(val: any): boolean {
        if (val === null || val === undefined) {
            return false;
        }
        return NumberRatchet.safeNumber(val) !== 0;
    }

    public static boolToInt(val: any): number {
        return (BooleanRatchet.parseBool(val)) ? 1 : 0;
    }

}

