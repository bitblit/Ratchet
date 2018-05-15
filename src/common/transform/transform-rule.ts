
/*
    Functions as input for the transformer
*/

export interface TransformRule{
    transform(value:any, isKey:boolean) : any;
}

