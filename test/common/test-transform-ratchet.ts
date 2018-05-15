import { expect } from 'chai';
import {TransformRatchet} from "../../src/common/transform-ratchet";
import {BuiltInTransforms} from "../../src/common/transform/built-in-transforms";

describe('#formatBytes', function() {

    let srcData = {
        key1 : 'value1',
        key2 : 'value2',
        intKey1 : 1,
        boolKey1 : true,
        subKey : {
            key1 : 'subValue1',
            key2 : 'subValue2'
        }
    };

    it('should strip a key correctly', function() {
        let result = TransformRatchet.transformObject(srcData, [BuiltInTransforms.stripStringTransform('key1')]);
        expect(result.key1).to.be.undefined;
    });

    it('should rename a key correctly', function() {
        let result = TransformRatchet.transformObject(srcData, [BuiltInTransforms.stringReplaceTransform('key1','newKey1')]);
        expect(result.key1).to.be.undefined;
        expect(result.newKey1).to.equal('value1');
        expect(result.subKey.key1).to.be.undefined;
        expect(result.subKey.newKey1).to.equal('subValue1');
        console.log(JSON.stringify(result));
    });


    it('should retain only key1 and key2', function() {
        let result = TransformRatchet.transformObject(srcData, [BuiltInTransforms.keysOnly(BuiltInTransforms.retainAll(['key1','key2']))]);
        expect(result.key1).to.not.be.undefined;
        expect(result.key2).to.not.be.undefined;
        expect(result.intKey1).to.be.undefined;
        expect(result.boolKey1).to.be.undefined;
        expect(result.subKey).to.be.undefined;
    });

    it('should remove only key1 and key2', function() {
        let result = TransformRatchet.transformObject(srcData, [BuiltInTransforms.keysOnly(BuiltInTransforms.removeAll(['key1','key2']))]);
        expect(result.key1).to.be.undefined;
        expect(result.key2).to.be.undefined;
        expect(result.intKey1).to.not.be.undefined;
        expect(result.boolKey1).to.not.be.undefined;
        expect(result.subKey).to.not.be.undefined;
    });

});