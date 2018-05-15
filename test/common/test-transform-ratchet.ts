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

    let srcUnderData = {
        new_key_1 : 'value1',
        sub_key : {
            new_key_2 : 'value2'
        }
    };

    it('should concatenate key1 and key2 into key3', function() {
        let result = TransformRatchet.transform(srcData, [BuiltInTransforms.concatenateToNewField('key3',['key1','key2'])]);
        expect(result.key1).to.be.undefined;
        expect(result.key2).to.be.undefined;
        expect(result.key3).to.equal('value1value2');
        expect(result.subKey.key1).to.be.undefined;
        expect(result.subKey.key2).to.be.undefined;
        expect(result.subKey.key3).to.equal('subValue1subValue2');
    });

    it('should strip a key correctly', function() {
        let result = TransformRatchet.transform(srcData, [BuiltInTransforms.stripStringTransform('key1')]);
        expect(result.key1).to.be.undefined;
    });

    it('should rename a key correctly', function() {
        let result = TransformRatchet.transform(srcData, [BuiltInTransforms.stringReplaceTransform('key1','newKey1')]);
        expect(result.key1).to.be.undefined;
        expect(result.newKey1).to.equal('value1');
        expect(result.subKey.key1).to.be.undefined;
        expect(result.subKey.newKey1).to.equal('subValue1');
    });


    it('should retain only key1 and key2', function() {
        let result = TransformRatchet.transform(srcData, [BuiltInTransforms.keysOnly(BuiltInTransforms.retainAll(['key1','key2']))]);
        expect(result.key1).to.not.be.undefined;
        expect(result.key2).to.not.be.undefined;
        expect(result.intKey1).to.be.undefined;
        expect(result.boolKey1).to.be.undefined;
        expect(result.subKey).to.be.undefined;
    });

    it('should remove only key1 and key2', function() {
        let result = TransformRatchet.transform(srcData, [BuiltInTransforms.keysOnly(BuiltInTransforms.removeAll(['key1','key2']))]);
        expect(result.key1).to.be.undefined;
        expect(result.key2).to.be.undefined;
        expect(result.intKey1).to.not.be.undefined;
        expect(result.boolKey1).to.not.be.undefined;
        expect(result.subKey).to.not.be.undefined;
    });

    it('should convert underscore to camelcase', function() {
        let result = TransformRatchet.transform(srcUnderData, [BuiltInTransforms.keysOnly(BuiltInTransforms.underscoreToCamelCase())]);
        expect(result['new_key_1']).to.be.undefined;
        expect(result['sub_key']).to.be.undefined;
        expect(result.newKey1).to.not.be.undefined;
        expect(result.subKey).to.not.be.undefined;
        expect(result.subKey.newKey2).to.not.be.undefined;
    });


});