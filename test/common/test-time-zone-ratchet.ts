import { expect } from 'chai';
import {TimeZoneRatchet} from "../../src/common/time-zone-ratchet";
import {Logger} from "../../src/common/logger";

let tz: TimeZoneRatchet = TimeZoneRatchet.PACIFIC;

describe('#currentHour', function() {
    it('should return 0- 23', function() {
        let result : number = tz.currentHour();
        expect(result).to.be.gte(0);
        expect(result).to.be.lte(23);
    });
});

describe('#startOfTodayEpochSeconds', function() {

    it('should never be more than now or more than 86400 seconds in the past', function() {
        let now : number = Math.floor(new Date().getTime()/1000);
        let start : number = tz.startOfTodayEpochSeconds();
        let result : number = now-start;
        expect(result).to.be.gte(0);
        expect(result).to.be.lte(86400);
    });

});


describe('#dailySlotCount', function() {

    it('should return 86400', function() {
        let result : number = tz.dailySlotCount(1000);
        expect(result).to.eq(86400);
    });

});


describe('#currentTimeSlotIdx', function() {

    it('should return same as current hour', function() {
        let curHour : number = tz.currentHour();
        let hourSlot : number = 1000*60*60;
        let curSlot : number = tz.currentTimeSlotIdx(hourSlot);

        expect(curSlot).to.eq(curHour);
    });

});


describe('#matchingTimeSlotIdx', function() {

    it('should return same as current hour', function() {
        let curHour : number = tz.currentHour();
        let hourSlot : number = 1000*60*60;
        let matchSlot: number = tz.matchingTimeSlotIdx(new Date().getTime(), hourSlot);

        expect(matchSlot).to.eq(curHour);
    });

});