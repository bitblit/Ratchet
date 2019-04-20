import { expect } from 'chai';
import { DurationRatchet } from "../../src/common/duration-ratchet";

describe('#formatMsDuration', function() {
    it('should format less than one second', function() {
        let result = DurationRatchet.formatMsDuration(409,true);
        expect(result).to.equal('00h00m00.409s');
    });
});

describe('#colonFormatMsDuration', function() {
    it('should format less than one second', function() {
        let result = DurationRatchet.colonFormatMsDuration(409,true);
        expect(result).to.equal('00:00:00.409');
    });

    it('should format more than ten hours', function() {
        let result = DurationRatchet.colonFormatMsDuration((1000*60*60*11),false);
        expect(result).to.equal('11:00:00');
    });

    it('should format 15 seconds', function() {
        let result = DurationRatchet.colonFormatMsDuration((15000),false);
        expect(result).to.equal('00:00:15');
    });

});