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
