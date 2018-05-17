import { expect } from 'chai';
import {TransformRatchet} from "../../src/common/transform-ratchet";
import {BuiltInTransforms} from "../../src/common/transform/built-in-transforms";
import {PromiseRatchet} from "../../src/common/promise-ratchet";

let fnFalse = (ignored)=>{return false;};
let fnOn3 = (t)=>{return t==3;};

describe('#promiseRatchet', function() {

    it('should timeout eventually', () => {

        let promise : Promise<boolean> = PromiseRatchet.waitFor(fnFalse, true, 100, 2);

        return promise.then( (result) => {
            expect(result).to.equal(false);
        });
    });

    it('should succeed on 3rd try', () => {

        let promise : Promise<boolean> = PromiseRatchet.waitFor(fnOn3, true, 100, 4);

        return promise.then( (result) => {
            expect(result).to.equal(true);
        });
    });

});