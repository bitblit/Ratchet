import {KeyValue} from './key-value';
import {MapRatchet} from './map-ratchet';

describe('#toKeyValueList', function () {
  it('should expand a maps nested keys', function () {
    const test: any = { 'a.b': 'c', 'c.d[0].e': 2 };
    const out: any = MapRatchet.expandNestedKeys<any>(test);

    expect(out).toBeTruthy();
    expect(out.a).toBeTruthy();
    expect(out.a.b).toBeTruthy();
    expect(out.a.b).toEqual('c');
    expect(out.c).toBeTruthy();
    expect(out.c.d).toBeTruthy();
    expect(out.c.d.length).toEqual(1);
    expect(out.c.d[0].e).toBeTruthy();
    expect(out.c.d[0].e).toEqual(2);
  });

  it('should convert a map to a key-value list and back', function () {
    const test: any = { key1: 'value1', key2: 'value2' };

    const kvl: KeyValue[] = MapRatchet.toKeyValueList(test);
    expect(kvl.length).toEqual(2);

    const back: any = MapRatchet.fromKeyValueList(kvl);

    expect(back['key1']).toEqual('value1');
    expect(back['key2']).toEqual('value2');
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

    expect(Object.keys(clean).length).toEqual(3);
    expect(Object.keys(clean).indexOf('key1')).toEqual(-1);
    expect(Object.keys(clean).indexOf('key2')).toEqual(-1);
    expect(Object.keys(clean).indexOf('key3')).toBeGreaterThan(-1);
    expect(Object.keys(clean).indexOf('key4')).toBeGreaterThan(-1);
    expect(Object.keys(clean).indexOf('key5')).toBeGreaterThan(-1);
    expect(clean['key5']['key7']).toEqual('also_fine');
  });

  it('should extract values ignoring case', function () {
    const test: any = {
      'this-Test': 'a',
      test22: 'b',
    };

    expect(MapRatchet.extractValueFromMapIgnoreCase(test, 'THIS-TEST')).toEqual('a');
    expect(MapRatchet.extractValueFromMapIgnoreCase(test, 'tEst22')).toEqual('b');
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

    expect(grouped).toBeTruthy();
    const aGroup: any[] = grouped.get('a');
    expect(aGroup).toBeTruthy();
    expect(aGroup.length).toEqual(2);
    expect(grouped.has('b')).toBeTruthy();
    expect(grouped.has('c')).toBeFalsy();
  });

  it('should fetch a value with a case-insensitive key', function () {
    const testOb: any = {
      test1: 'a',
      Test2: 'b',
      test3: 'c',
      Test3: 'd',
    };

    expect(MapRatchet.caseInsensitiveAccess(null, null)).toBeNull();
    expect(MapRatchet.caseInsensitiveAccess({}, null)).toBeNull();
    expect(MapRatchet.caseInsensitiveAccess(null, 'a')).toBeNull();

    expect(MapRatchet.caseInsensitiveAccess(testOb, 'test1')).toEqual('a');
    expect(MapRatchet.caseInsensitiveAccess(testOb, 'test2')).toEqual('b');
    expect(MapRatchet.caseInsensitiveAccess(testOb, 'TEST2')).toEqual('b');
    expect(MapRatchet.caseInsensitiveAccess(testOb, 'test3')).toEqual('c');
  });
});
