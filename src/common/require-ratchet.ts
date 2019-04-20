/*
    Functions for making simple assertions
*/


export class RequireRatchet {

    public static notNullOrUndefined(ob: any, name:string = 'object'):void {
        if (ob===null || ob===undefined) {
            throw new Error(name+' may not be null or undefined');
        }
    }

}

