import { expect } from 'chai';
import {KeyValue} from '../../src/common/key-value';
import {MapRatchet} from '../../src/common/map-ratchet';

describe('#toKeyValueList', function() {
    it('should convert a map to a key-value list and back', function() {
        let test : any = {'key1':'value1', 'key2':'value2'};

        let kvl : KeyValue[] = MapRatchet.toKeyValueList(test);
        expect(kvl.length).to.equal(2);

        let back : any = MapRatchet.fromKeyValueList(kvl);

        expect(back['key1']).to.equal('value1');
        expect(back['key2']).to.equal('value2');

    });

});
