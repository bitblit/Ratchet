/*
    Functions for working with arrays
*/

export class ArrayRatchet {

    public static wrapElementsInArray(input: any[]): any[][] {
        return input.map(i=> [i]);
    }

}
