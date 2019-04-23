/*
    Functions for making simple assertions
*/


export class RequireRatchet {

    public static notNullOrUndefined(ob: any, name:string = 'object'):void {
        if (ob===null || ob===undefined) {
            throw new Error(name+' may not be null or undefined');
        }
    }

    public static equal(ob1: any, ob2: any, message:string = 'Values must be equal'):void {
        if (ob1!==ob2) {
            throw new Error(message);
        }
    }

    public static true(ob: boolean, name:string = 'Value must be true'):void {
        RequireRatchet.equal(ob, true, message);
    }


}

