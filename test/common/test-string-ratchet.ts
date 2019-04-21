import { expect } from 'chai';
import { DurationRatchet } from "../../src/common/duration-ratchet";
import {StringRatchet} from "../../src/common/string-ratchet";

describe('#formatBytes', function() {
    it('should format 0 bytes correctly', function() {
        let result = StringRatchet.formatBytes(0);
        expect(result).to.equal('0 Bytes');
    });

    it('should format less than a Kb correctly', function() {
        let result = StringRatchet.formatBytes(123);
        expect(result).to.equal('123 Bytes');
    });

    it('should format less than a Mb correctly', function() {
        let result = StringRatchet.formatBytes(1024);
        expect(result).to.equal('1 KB');
    });

    it('should format less than a Mb correctly with 3 decimals', function() {
        let result = StringRatchet.formatBytes(1234,3);
        expect(result).to.equal('1.205 KB');
    });

});


describe('#safeToString', function() {
    it('should return "asdf"', function() {
        let result = StringRatchet.safeString("asdf");
        expect(result).to.equal('asdf');
    });

    it('should return "55"', function() {
        let result = StringRatchet.safeString(55)
        expect(result).to.equal('55');
    });
});


describe('#obscure', function() {
    it('should return "pa****rd"', function() {
        let result = StringRatchet.obscure('password', 2,2);
        expect(result).to.equal('pa****rd');
    });

    it('should return null', function() {
        let result = StringRatchet.obscure(null, 2,2);
        expect(result).to.be.null;
    });

    it('should return "p**s"', function() {
        let result = StringRatchet.obscure('pass', 2,2);
        expect(result).to.equal('p**s');
    });

    it('should return "****"', function() {
        let result = StringRatchet.obscure('pass', 0,0);
        expect(result).to.equal('****');
    });

    it('should return "p***"', function() {
        let result = StringRatchet.obscure('pass', 1,0);
        expect(result).to.equal('p***');
    });

    it('should return "***s"', function() {
        let result = StringRatchet.obscure('pass', 0,1);
        expect(result).to.equal('***s');
    });

});


describe('#guid', function() {
    it('should generate a guid"', function() {
        let result = StringRatchet.createType4Guid();
        expect(result).to.not.be.null;
    });

});

describe('#randomHexString', function() {
    it('should generate a random hex string"', function() {
        let result = StringRatchet.createRandomHexString(12);
        expect(result).to.not.be.null;
        expect(result.length).to.equal(12);
    });

});


describe('#leadingZeros', function() {
    it('should generate string with leading zeros"', function() {
        let result = StringRatchet.leadingZeros(25, 4);
        expect(result).to.equal('0025');
    });

});

describe('#stripNonNumeric', function() {
    it('should return a string containing only numbers"', function() {
        let result: string = StringRatchet.stripNonNumeric('702-555-1212');
        expect(result).to.equal('7025551212');
    });

});