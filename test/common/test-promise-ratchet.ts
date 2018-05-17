import { expect } from 'chai';
import {TransformRatchet} from "../../src/common/transform-ratchet";
import {BuiltInTransforms} from "../../src/common/transform/built-in-transforms";
import {PromiseRatchet} from "../../src/common/promise-ratchet";

describe('#promiseRatchet', function() {

    it('should timeout eventually', () => {
        let fn = function(){return false;};

        let promise : Promise<boolean> = PromiseRatchet.waitFor(fn, true, 100, 2);

        return promise.then( (result) => {
            expect(result).to.equal(false);
        });
    });

    it('should succeed on 3rd try', () => {
        let fn = function(t){return t==3;};

        let promise : Promise<boolean> = PromiseRatchet.waitFor(fn, true, 100, 4);

        return promise.then( (result) => {
            expect(result).to.equal(true);
        });
    });

});