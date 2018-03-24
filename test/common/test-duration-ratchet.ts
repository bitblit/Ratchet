import { expect } from 'chai';
import { DurationRatchet } from "../../src/common/duration-ratchet";

describe('#formatMsDuration', function() {
    it('should format less than one second', function() {
        let result = DurationRatchet.formatMsDuration(409,true);
        expect(result).to.equal('00h00m00.409s');
    });
});