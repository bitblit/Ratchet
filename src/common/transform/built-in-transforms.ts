
/*
    Replace exact string X with Y
*/

import {TransformRule} from "./transform-rule";

export class BuiltInTransforms{


    public static keysOnly(rule:TransformRule) : TransformRule
    {
        return {
            transform(value:any, isKey:boolean) : any
            {
                return (isKey)?rule.transform(value, isKey):value;
            }
        } as TransformRule
    }

    public static valuesOnly(rule:TransformRule) : TransformRule
    {
        return {
            transform(value:any, isKey:boolean) : any
            {
                return (!isKey)?rule.transform(value, isKey):value;
            }
        } as TransformRule
    }


    public static stringReplaceTransform(input:string, output:string) : TransformRule
    {
        return {
            transform(value:any, isKey:boolean) : any
            {
                return (value==input)?output:value;
            }
        } as TransformRule
    }

    public static stripStringTransform(input:string) : TransformRule
    {
        return {
            transform(value:any, isKey:boolean) : any
            {
                return (value==input)?null:value;
            }
        } as TransformRule
    }

    public static retainAll(input:string[]) : TransformRule
    {
        return {
            transform(value:any, isKey:boolean) : any
            {
                return (input.indexOf(value)==-1)?null:value;
            }
        } as TransformRule
    }

    public static removeAll(input:string[]) : TransformRule
    {
        return {
            transform(value:any, isKey:boolean) : any
            {
                return (input.indexOf(value)>-1)?null:value;
            }
        } as TransformRule
    }

}

