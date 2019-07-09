import { timer } from 'rxjs/observable/timer';
import { expect } from 'chai';
import {ObservableRatchet} from "../../src/common/observable-ratchet";

describe('#timeout', function() {
    it('should correctly return before timeout', function() {
        let src = timer(1000);
        let timeoutOb = ObservableRatchet.timeout(src, '1000ms interval', 1500);
        timeoutOb.subscribe(result =>
            expect(result).to.equal('0')
        );
    });

    it('should correctly returns null after timeout', function() {
        let src = timer(1500);
        let timeoutOb = ObservableRatchet.timeout(src, '1500ms interval', 1000);
        timeoutOb.subscribe(result =>
            expect(result).to.be.null
        );
    });

    it('should throw error after timeout', function() {
        let src = timer(1500);
        let timeoutOb = ObservableRatchet.timeout(src, '1500ms interval', 1000);
        timeoutOb.subscribe(result =>expect.fail(),
            err=>expect(err).to.not.be.null
        );
    });

});