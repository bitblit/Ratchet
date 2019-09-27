import { expect } from 'chai';
import {BooleanRatchet} from "../../src/common/boolean-ratchet";
import {ArrayRatchet, MatchReport} from '../../src/common/array-ratchet';

describe('#compareTwoArrays', function() {
    it('should create a match report', function() {
        let arr1: string[] = ['a','b','c'];
        let arr2: string[] = ['a','e','i','o','u'];

        let report: MatchReport<string> = ArrayRatchet.compareTwoArrays(arr1, arr2, (a,b)=>a.localeCompare(b));

        expect(report).to.not.be.null;
        expect(report.setOneOnly.length).to.eq(2);
        expect(report.setTwoOnly.length).to.eq(4);
        expect(report.matching.length).to.eq(1);
    });

});
