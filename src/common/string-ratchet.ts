
/*
    Functions for working with strings
*/

import {Logger} from "./logger";

export class StringRatchet {
    // % isn't technically reserved but its still a pain in the butt
    public static RFC_3986_RESERVED = ['!', '*', '\'', '(', ')', ';', ':', '@', '&', '=', '+', '$', ',', '/', '?', '#', '[', ']',
        '%'];

    public static createType4Guid(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    public static canonicalize(value:string): string {
        let rval = (value)?value.toLowerCase():'';

        rval = rval.replace(" ","-");
        StringRatchet.RFC_3986_RESERVED.forEach(s=>{
            rval = rval.replace(s, '');
        });

        return rval;
    }

    // Taken from https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
    public static formatBytes(bytes : number,decimals:number=2) {
        if(bytes == 0) return '0 Bytes';
        var k = 1024,
            dm = decimals || 2,
            sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    // Converts anything that isn't a string to a string
    public static safeString(input: any) : string{
        let rval : string = null;
        if (input != null)
        {
            let type : string = typeof input;
            if (type == 'string')
            {
                rval = input;
            }
            else
            {
                rval = String(input);
            }
        }
        return rval;
    }

}

