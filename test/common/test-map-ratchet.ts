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

    it('should remove null and empty strings but not 0', function() {
        let test : any = {'key1':'', 'key2':null, 'key3': 0, 'key4': 'fine', 'key5': {
            'key6' : null,
                'key7' : 'also_fine'
            }};

        let clean : any = MapRatchet.cleanup(test);

        expect(Object.keys(clean).length).to.equal(3);
        expect(Object.keys(clean).indexOf('key1')).to.equal(-1);
        expect(Object.keys(clean).indexOf('key2')).to.equal(-1);
        expect(Object.keys(clean).indexOf('key3')).to.be.greaterThan(-1);
        expect(Object.keys(clean).indexOf('key4')).to.be.greaterThan(-1);
        expect(Object.keys(clean).indexOf('key5')).to.be.greaterThan(-1);
        expect(clean['key5']['key7']).to.equal('also_fine');
    });

});
