import { expect } from 'chai';
import {NumberRatchet} from "../../src/common/number-ratchet";

describe('#safeToNumber', function() {
    it('should convert "55" to 55', function() {
        let result : number = NumberRatchet.safeNumber("55");
        expect(result).to.equal(55);
    });

    it('should leave 66 alone', function() {
        let result :number = NumberRatchet.safeNumber(66);
        expect(result).to.equal(66);
    });

    it('should return the default when it cannot parse', function() {
        let result : number = NumberRatchet.safeNumber({test:'test'},42);
        expect(result).to.equal(42);
    });

});

describe('#parseCSV', function() {
    it('should convert "1,2,3" to [1,2,3]', function() {
        let result : number[] = NumberRatchet.numberCSVToList('1,2,3');
        expect(result.length).to.equal(3);
    });

    it('should convert " 1, 2,3  " to [1,2,3]', function() {
        let result : number[] = NumberRatchet.numberCSVToList(' 1, 2,3 ');
        expect(result.length).to.equal(3);
    });

    it('should convert " a1, 2,b  " to [2]', function() {
        let result : number[] = NumberRatchet.numberCSVToList(' a1, 2,b  ');
        expect(result.length).to.equal(1);
        expect(result[0]).to.equal(2);
    });

});
