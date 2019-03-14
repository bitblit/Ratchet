import { expect } from 'chai';
import {BooleanRatchet} from "../../src/common/boolean-ratchet";
import {PromiseRatchet} from '../../src/common/promise-ratchet';
import {BehaviorSubject} from 'rxjs';
import {Logger} from '../../src/common/logger';
import {RxjsRatchet} from '../../src/rxjs/rxjs-ratchet';

describe('#waitForNonNullOnSubject', function() {

    this.timeout(30000);

    /*
    it('should resolve after 5 seconds', async()=> {

        const sub: BehaviorSubject<number> = new BehaviorSubject<number>(null);
        const testFn: any = PromiseRatchet.wait(5000).then(r=>{sub.next(5)});

        Logger.info('Waiting for non-null');

        const result: number = await RxjsRatchet.waitForNonNullOnSubject(sub);
        Logger.info('Got %d', result);

        expect(result).to.equal(5);
    });
    */

});
