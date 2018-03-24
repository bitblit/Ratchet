
/*
    Functions for working with strings
*/

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

}

