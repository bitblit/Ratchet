/*
    Functions for working with base64
*/

import {Logger} from './logger';

export class Base64Ratchet {

    public static safeBase64JSONParse(input: string): any {
        let rval: any = {};
        try {
            if (input) {
                rval = JSON.parse(atob(input));
            }
        }
        catch (err) {
            Logger.warn("Error parsing b64/json : %s as json, got %s", input, err, err);
            rval = {};
        }
        return rval;
    }


    public static generateBase64VersionOfBlob(blob: Blob): Promise<string> {
        return new Promise(function (resolve, reject) {
            if (!blob || blob.size == 0) {
                reject("Wont convert null or non-blob or empty blob");
            }
            else {
                let reader = new FileReader();
                reader.onloadend = function () {
                    resolve(reader.result.toString());
                };
                reader.readAsDataURL(blob);
            }
        });
    }

}
