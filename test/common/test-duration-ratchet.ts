import { expect } from 'chai';
import { DurationRatchet } from "../../src/common/duration-ratchet";
import moment = require('moment');

describe('#formatMsDuration', function() {
    it('should format less than one second', function() {
        let result = DurationRatchet.formatMsDuration(409,true);
        expect(result).to.equal('00h00m00.409s');
    });
    it('should format more than one day', function() {
        let result = DurationRatchet.formatMsDuration((1000*60*60*123),true);
        expect(result).to.equal('5d03h00m00.000s');
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

    it('should format more than one hundred hours', function() {
        let result = DurationRatchet.colonFormatMsDuration((1000*60*60*123),false);
        expect(result).to.equal('123:00:00');
    });

    it('should format 15 seconds', function() {
        let result = DurationRatchet.colonFormatMsDuration((15000),false);
        expect(result).to.equal('00:00:15');
    });

});


describe('#createSteps', function() {
    it('should create steps', function() {
        let startEpochMS: number = moment('2019-01-01','YYYY-MM-DD').toDate().getTime();
        let endEpochMS: number = moment('2019-01-05','YYYY-MM-DD').toDate().getTime();

        let steps: string[] = DurationRatchet.createSteps(startEpochMS,endEpochMS,'etc/GMT', 'YYYY-MM-DD', 'd');

        expect(steps.length).to.eq(4);
    });
});
