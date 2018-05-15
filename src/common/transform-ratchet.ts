
/*
    Functions for working with maps (dictionaries/objects in javascript)

    For each entry:
    1) Apply to key
    2) If the key is now null, skip it, else:
    2a) If the value is an array or map, recursively descend it
    2b) Apply to value
    3) If the value is now null, skip it.  Else, put into new result

*/

import {TransformRule} from "./transform/transform-rule";

export class TransformRatchet {

    public static transformObject(toTransform:any, rules: TransformRule[]=[], isKey:boolean=false) : any{
        let rval : any = null;
        let type : string = typeof toTransform;
        switch(type)
        {
            case 'undefined' : case 'symbol' : case 'function' : rval = toTransform; break;
            case 'number' : case 'string' : case 'boolean' : rval = TransformRatchet.applyTransformToPrimitive(toTransform, rules, isKey); break;
            case 'object' : rval = TransformRatchet.applyTransformToObject(toTransform, rules, isKey);break;
            default : throw new Error("Unrecognized type "+type);
        }
        return rval;

    }

    private static applyTransformToObject(toTransform:object, rules: TransformRule[]=[], isKey:boolean)
    {
        let rval : any = null;
        if (toTransform!=null)
        {
            if (Array.isArray(toTransform))
            {
                rval = [];
                toTransform.forEach(val=>{
                    let newVal = TransformRatchet.transformObject(val, rules, isKey);
                    if (newVal!=null)
                    {
                        rval.push(newVal);
                    }
                });
            }
            else {
                // Its a complex object
                rval = {};
                Object.keys(toTransform).forEach(k=>{
                    // First, transform the key
                    let oldValue = toTransform[k];
                    let newKey = TransformRatchet.applyTransformToPrimitive(k, rules, true);
                    if (newKey!=null)
                    {
                        let newValue = TransformRatchet.transformObject(oldValue, rules, false);
                        if (newValue!=null)
                        {
                            rval[newKey]=newValue;
                        }
                    }
                })
            }
        }
        return rval;
    }

    private static applyTransformToPrimitive(toTransform:number|string|boolean, rules: TransformRule[]=[], isKey:boolean)
    {
        let rval : any = toTransform;
        rules.forEach(r=>{rval = (rval==null)?null:r.transform(rval,isKey);});
        return rval;
    }

}

