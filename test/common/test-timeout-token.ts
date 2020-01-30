import { expect } from 'chai';
import {TimeZoneRatchet} from "../../src/common/time-zone-ratchet";
import {Logger} from "../../src/common/logger";
import {TimeoutToken} from '../../src/common/timeout-token';


describe('#timeoutToken', function() {
    it('should return the correct value for isTimeoutToken', function() {
        const tt: TimeoutToken = new TimeoutToken('title',20000);
        const ntt: any = {a:'b'};

        expect(TimeoutToken.isTimeoutToken(tt)).to.be.true;
        expect(TimeoutToken.isTimeoutToken(ntt)).to.be.false;

    });
});
