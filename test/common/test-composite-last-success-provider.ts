import { expect } from 'chai';
import {BooleanRatchet} from "../../src/common/boolean-ratchet";
import {LastSuccessProvider} from "../../src/common/last-success-provider";
import {CompositeLastSuccessProvider} from "../../src/common/composite-last-success-provider";

describe('#lastSuccess', function() {

    let last5 : LastSuccessProvider = {lastSuccess():number {return 5;}} as LastSuccessProvider;
    let last4 : LastSuccessProvider = {lastSuccess():number {return 4;}} as LastSuccessProvider;
    let lastNull : LastSuccessProvider = {lastSuccess():number{return null;}} as LastSuccessProvider;

    it('should return 4 as last (min)', function() {
        let result : number = new CompositeLastSuccessProvider([last5,last4,lastNull], false).lastSuccess();
        expect(result).to.equal(4);
    });

    it('should return 5 as last (max)', function() {
        let result : number = new CompositeLastSuccessProvider([last5,last4,lastNull], true).lastSuccess();
        expect(result).to.equal(5);
    });

});