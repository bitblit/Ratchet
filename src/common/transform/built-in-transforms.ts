
/*
    Some useful transforms for the transform ratchet
*/

import {TransformRule} from "./transform-rule";

export class BuiltInTransforms{


    public static keysOnly(rule:TransformRule) : TransformRule
    {
        return {
            transform(value:any, isKey:boolean, context:any) : any
            {
                return (isKey)?rule.transform(value, isKey,context):value;
            }
        } as TransformRule
    }

    public static valuesOnly(rule:TransformRule) : TransformRule
    {
        return {
            transform(value:any, isKey:boolean, context:any) : any
            {
                return (!isKey)?rule.transform(value, isKey,context):value;
            }
        } as TransformRule
    }


    public static stringReplaceTransform(input:string, output:string) : TransformRule
    {
        return {
            transform(value:any, isKey:boolean, context:any) : any
            {
                return (value==input)?output:value;
            }
        } as TransformRule
    }

    public static stripStringTransform(input:string) : TransformRule
    {
        return {
            transform(value:any, isKey:boolean, context:any) : any
            {
                return (value==input)?null:value;
            }
        } as TransformRule
    }

    public static retainAll(input:string[]) : TransformRule
    {
        return {
            transform(value:any, isKey:boolean, context:any) : any
            {
                return (input.indexOf(value)==-1)?null:value;
            }
        } as TransformRule
    }

    public static removeAll(input:string[]) : TransformRule
    {
        return {
            transform(value:any, isKey:boolean, context:any) : any
            {
                return (input.indexOf(value)>-1)?null:value;
            }
        } as TransformRule
    }

    public static underscoreToCamelCase() : TransformRule
    {
        return {
            transform(value:any, isKey:boolean, context:any) : any
            {
                let rval = value;
                if (typeof value == 'string')
                {
                    // Taken, mainly, from https://stackoverflow.com/questions/4969605/javascript-regexp-to-camelcase-a-hyphened-css-property
                    rval = value.replace(/_([a-z0-9])/gi, function(s, group1) {
                        return group1.toUpperCase();
                    });
                }
                return rval;
            }
        } as TransformRule
    }

    public static concatenateToNewField(newFieldName: string, oldFieldNamesInOrder: string[], abortIfFieldMissing: boolean = true) : TransformRule
    {
        return {
            transform(value:any, isKey:boolean, context:any) : any
            {
                if (typeof value == 'object')
                {
                    let rval = '';
                    oldFieldNamesInOrder.forEach(n=>{
                        if (rval!=null)
                        {
                            let temp = value[n];
                            if (temp==null && abortIfFieldMissing)
                            {
                                rval = null;
                            }
                            else
                            {
                                rval = (temp==null)?rval:rval+String(temp);
                            }
                        }
                    });
                    if (rval!=null)
                    {
                        value[newFieldName]=rval;
                        oldFieldNamesInOrder.forEach(n=>delete value[n]);
                    }
                }
                return value;
            }
        } as TransformRule
    }

    public static numberToBool(fieldNames: string[]) : TransformRule
    {
        return {
            transform(value:any, isKey:boolean, context:any) : any
            {
                if (typeof value == 'object')
                {
                    fieldNames.forEach(n=>{
                        let oldVal = value[n];
                        if (typeof oldVal == 'number')
                        {
                            let newVal = (0!=oldVal);
                            value[n]=newVal;
                        }
                    });
                }
                return value;
            }
        } as TransformRule
    }

    public static boolToNumber(fieldNames: string[]) : TransformRule
    {
        return {
            transform(value:any, isKey:boolean, context:any) : any
            {
                if (typeof value == 'object')
                {
                    fieldNames.forEach(n=>{
                        let oldVal = value[n];
                        if (typeof oldVal == 'boolean')
                        {
                            let newVal = (oldVal)?1:0;
                            value[n]=newVal;
                        }
                    });
                }
                return value;
            }
        } as TransformRule
    }

}

