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