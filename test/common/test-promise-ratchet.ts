import { expect } from 'chai';
import {TransformRatchet} from "../../src/common/transform-ratchet";
import {BuiltInTransforms} from "../../src/common/transform/built-in-transforms";
import {PromiseRatchet} from '../../src/common/promise-ratchet';
import {Logger} from '../../src/common/logger';
import {TimeoutToken} from '../../src/common/timeout-token';

let fnFalse = (ignored)=>{return false;};
let fnOn3 = (t)=>{Logger.info('t=%d',t);return t==3;};
let waitAndPrint = async(t1:number, t2:string)=>{Logger.info('Running: %s',t2);await PromiseRatchet.wait(t1*2);return t1*2};

describe('#promiseRatchet', function() {
    this.timeout(30000);

    it('should timeout eventually', async () => {

        try {
            Logger.setLevelByName('silly');
            let result: boolean | TimeoutToken = await PromiseRatchet.waitFor(fnFalse, true, 100, 2);
            Logger.info('Got : %s', result);
            expect(result).to.equal(false);
        } catch (err) {
            Logger.warn('Error: %s',err,err);
        }
    });

    it('should succeed on 3rd try', async () => {

        let promise : Promise<boolean> = PromiseRatchet.waitFor(fnOn3, true, 100, 4);
        let result: boolean | TimeoutToken = await promise;
        expect(result).to.equal(true);

    });

    /*
    it('should run 10 elements, 2 at a time', async () => {

        Logger.setLevelByName('debug');
        const elements: any[][]=[[100,'Test1'],[200,'Test2'],[300,'Test3'],[400,'Test4'],
            [500,'Test5'],[600,'Test6'],[700,'Test7'],[800,'Test8'],[900,'Test9'],[1000,'Test10']];

        let results:number[] = await PromiseRatchet.runBoundedParallel<number>(waitAndPrint, elements,this, 2);

        Logger.info('Final results %j', results);
        expect(results).to.not.be.null;
        expect(results.length).to.eq(10);
    });


    it('should run 10 waits, 2 at a time', async () => {

        Logger.setLevelByName('debug');
        const elements: number[] = [100,200,300,400,500,600,700,800,900,1000];

        let results:any[] = await PromiseRatchet.runBoundedParallelSingleParam(PromiseRatchet.wait, elements, this, 2);

        Logger.info('Final results %j', results);
        expect(results).to.not.be.null;
        expect(results.length).to.eq(10);
    });
    */

});