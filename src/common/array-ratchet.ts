/*
    Functions for working with arrays
*/

export class ArrayRatchet {

    public static wrapElementsInArray(input: any[]): any[][] {
        return input.map(i=> [i]);
    }

    public static compareTwoArrays<T>(ar1: T[], ar2: T[], fn: ComparisonFunction<T>): MatchReport<T> {
        ar1.sort(fn);
        ar2.sort(fn);

        let id1: number = 0;
        let id2: number = 0;
        let rval: MatchReport<T> = {
            matching: [],
            setOneOnly: [],
            setTwoOnly: []
        };

        while (id1<ar1.length && id2<ar2.length) {
            let aVal: T = ar1[id1];
            let pVal: T = ar2[id2];
            let comp: number = fn(aVal, pVal);

            if (comp===0) {
                rval.matching.push(aVal);
                id1++;
                id2++;
            } else if (comp<0) {
                rval.setOneOnly.push(aVal);
                id1++;
            } else {
                rval.setTwoOnly.push(pVal);
                id2++;
            }
        }

        if (id1<ar1.length-1) {
            rval.setOneOnly = rval.setOneOnly.concat(ar1.slice(id1));
        }
        if (id2<ar2.length-1) {
            rval.setTwoOnly = rval.setTwoOnly.concat(ar2.slice(id2));
        }

        return rval;
    }

}

export interface ComparisonFunction<T> {
    (t1: T, t2:T): number
}

export interface MatchReport<T> {
    matching: T[];
    setOneOnly: T[];
    setTwoOnly: T[];
}
