import { expect } from 'chai';
import { KeyValue } from '../../src/common/key-value';
import { MapRatchet } from '../../src/common/map-ratchet';

describe('#toKeyValueList', function () {
  it('should expand a maps nested keys', function () {
    const test: any = { 'a.b': 'c', 'c.d[0].e': 2 };
    const out: any = MapRatchet.expandNestedKeys<any>(test);

    expect(out).is.not.null;
    expect(out.a).is.not.null;
    expect(out.a.b).is.not.null;
    expect(out.a.b).to.eq('c');
    expect(out.c).is.not.null;
    expect(out.c.d).is.not.null;
    expect(out.c.d.length).is.eq(1);
    expect(out.c.d[0].e).is.not.null;
    expect(out.c.d[0].e).to.eq(2);
  });

  it('should convert a map to a key-value list and back', function () {
    const test: any = { key1: 'value1', key2: 'value2' };

    const kvl: KeyValue[] = MapRatchet.toKeyValueList(test);
    expect(kvl.length).to.equal(2);

    const back: any = MapRatchet.fromKeyValueList(kvl);

    expect(back['key1']).to.equal('value1');
    expect(back['key2']).to.equal('value2');
  });

  it('should remove null and empty strings but not 0', function () {
    const test: any = {
      key1: '',
      key2: null,
      key3: 0,
      key4: 'fine',
      key5: {
        key6: null,
        key7: 'also_fine',
      },
    };

    const clean: any = MapRatchet.cleanup(test);

    expect(Object.keys(clean).length).to.equal(3);
    expect(Object.keys(clean).indexOf('key1')).to.equal(-1);
    expect(Object.keys(clean).indexOf('key2')).to.equal(-1);
    expect(Object.keys(clean).indexOf('key3')).to.be.greaterThan(-1);
    expect(Object.keys(clean).indexOf('key4')).to.be.greaterThan(-1);
    expect(Object.keys(clean).indexOf('key5')).to.be.greaterThan(-1);
    expect(clean['key5']['key7']).to.equal('also_fine');
  });

  it('should extract values ignoring case', function () {
    const test: any = {
      'this-Test': 'a',
      test22: 'b',
    };

    expect(MapRatchet.extractValueFromMapIgnoreCase(test, 'THIS-TEST')).to.equal('a');
    expect(MapRatchet.extractValueFromMapIgnoreCase(test, 'tEst22')).to.equal('b');
  });

  it('should group values', function () {
    const test: any[] = [
      {
        id: 1,
        type: 'a',
      },
      {
        id: 2,
        type: 'a',
      },
      {
        id: 3,
        type: 'b',
      },
    ];

    const grouped: Map<string, any> = MapRatchet.groupByProperty<any, string>(test, 'type');

    expect(grouped).to.not.be.null;
    const aGroup: any[] = grouped.get('a');
    expect(aGroup).to.not.be.null;
    expect(aGroup.length).to.eq(2);
    expect(grouped.has('b')).to.be.true;
    expect(grouped.has('c')).to.be.false;
  });

  it('should fetch a value with a case-insensitive key', function () {
    const testOb: any = {
      test1: 'a',
      Test2: 'b',
      test3: 'c',
      Test3: 'd',
    };

    expect(MapRatchet.caseInsensitiveAccess(null, null)).to.be.null;
    expect(MapRatchet.caseInsensitiveAccess({}, null)).to.be.null;
    expect(MapRatchet.caseInsensitiveAccess(null, 'a')).to.be.null;

    expect(MapRatchet.caseInsensitiveAccess(testOb, 'test1')).to.be.eq('a');
    expect(MapRatchet.caseInsensitiveAccess(testOb, 'test2')).to.be.eq('b');
    expect(MapRatchet.caseInsensitiveAccess(testOb, 'TEST2')).to.be.eq('b');
    expect(MapRatchet.caseInsensitiveAccess(testOb, 'test3')).to.be.eq('c');
  });
});
