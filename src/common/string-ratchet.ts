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

    public static createRandomHexString(len: number = 10): string {
        let r = '';
        for (let i = 0; i < len; i++) {
            r += Math.floor((Math.random() * 16)).toString(16);
        }
        return r;
    }

    public static canonicalize(value: string): string {
        let rval = (value) ? value.toLowerCase() : '';

        rval = rval.replace(' ', '-');
        StringRatchet.RFC_3986_RESERVED.forEach(s => {
            rval = rval.replace(s, '');
        });

        return rval;
    }

    // Taken from https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
    public static formatBytes(bytes: number, decimals: number = 2) {
        if (bytes == 0) return '0 Bytes';
        var k = 1024,
            dm = decimals || 2,
            sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    // Converts anything that isn't a string to a string
    public static safeString(input: any): string {
        let rval: string = null;
        if (input != null) {
            let type: string = typeof input;
            if (type == 'string') {
                rval = input;
            }
            else {
                rval = String(input);
            }
        }
        return rval;
    }

    public static stringContainsOnlyNumbers(input: string): boolean {
        const rval: boolean = /^[0-9]+$/.test(input);
        return rval;
    }
    public static stringContainsOnlyAlphanumeric(input: string): boolean {
        const rval: boolean = /^[0-9a-zA-Z]+$/.test(input);
        return rval;
    }
    public static stringContainsOnlyHex(input: string): boolean {
        const rval: boolean = /^[0-9a-fA-F]+$/.test(input);
        return rval;
    }
    public static stringContainsOnly(inVal: string, validCharsIn: string): boolean {
        const input: string = (!inVal)?'':inVal;
        const validChars: string = (!validCharsIn)?'':validCharsIn;
        let rval: boolean = true;

        for (let i=0;i<input.length && rval;i++) {
            rval = validChars.indexOf(input.charAt(i))>=0;
        }
        return rval;
    }

    public static obscure(input: string, prefixLength: number = 2, suffixLength: number = 2): string {
        if (!input) {
            return input;
        }
        const len: number = input.length;
        let pl: number = prefixLength;
        let sl: number = suffixLength;

        while (len > 0 && len < (pl + sl + 1)) {
            pl = Math.max(0, pl - 1);
            sl = Math.max(0, sl - 1);
        }
        const rem = len - (pl + sl);

        let rval: string = '';
        rval += input.substring(0, pl);
        // Yeah, I know.  I'm in a rush here
        for (let i = 0; i < rem; i++) {
            rval += '*';
        }
        rval += input.substring(len - sl);
        return rval;
    }

    public static leadingZeros(val: any, size: number): string {
        const pad = '00000000000000000000000000000000000000000000000000';
        if (size > pad.length) {
            throw new Error('Cannot format number that large');
        }

        return (pad + String(val)).slice(-1 * size);
    }

    public static trimToEmpty(input:string): string {
        let t: string = input || '';
        return t.trim();
    }

    public static trimToNull(input:string): string {
        const x: string = StringRatchet.trimToEmpty(input);
        return (x.length>0)?x:null;
    }

    public static stripNonNumeric( input:string): string {
        let rval:string = input;
        if (input != null && !StringRatchet.stringContainsOnlyNumbers(input)) {
            // Im sure there is a better way
            rval = '';
            for (let i=0;i<input.length;i++) {
                let c: string = input.charAt(i);
                if (StringRatchet.stringContainsOnlyNumbers(c) || (i===0 && c==='-')) {
                    rval += c;
                }
            }
        }

        return rval;
    }

    public static csvSafe(input: any): string {
        let rval: string = StringRatchet.trimToEmpty(StringRatchet.safeString(input));
        rval.split('"').join('\\"');
        if (rval.indexOf(',') !== -1 || rval.indexOf('"') !== -1 || rval.indexOf('\'') !== -1) {
            rval = '"'+rval+'"'
        }
        return rval;
    }


}

