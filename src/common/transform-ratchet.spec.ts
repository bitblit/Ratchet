import {TransformRatchet} from './transform-ratchet';
import {BuiltInTransforms} from './transform/built-in-transforms';

describe('#formatBytes', function () {
  const srcData = {
    key1: 'value1',
    key2: 'value2',
    dateKey1: '1995-02-01',
    intKey1: 0,
    intKey2: 1,
    boolKey1: true,
    boolKey2: false,
    camelSnake: 'this is a camel case',
    subKey: {
      key1: 'subValue1',
      key2: 'subValue2',
      convertToNumberInner: '42',
    },
    convertToNumber: '1',
    convertToNumberAlso: '20',
  };

  const srcUnderData = {
    new_key_1: 'value1',
    sub_key: {
      new_key_2: 'value2',
    },
  };

  it('should convert camel to snakecase', function () {
    const result = TransformRatchet.transform(srcData, [BuiltInTransforms.keysOnly(BuiltInTransforms.camelToSnakeCase())]);
    expect(result['dateKey1']).toBeUndefined();
    expect(result['intKey1']).toBeUndefined();
    expect(result['intKey2']).toBeUndefined();
    expect(result['boolKey1']).toBeUndefined();
    expect(result['boolKey2']).toBeUndefined();
    expect(result['subKey']).toBeUndefined();
    expect(result['date_key1']).toBeTruthy();
    expect(result['int_key1']).toEqual(0);
    expect(result['int_key2']).toBeTruthy();
    expect(result['bool_key1']).toBeTruthy();
    expect(result['bool_key1']).toBeTruthy();
    expect(result['sub_key']).toBeTruthy();
  });

  it('should duplicate key1 into key3', function () {
    const result = TransformRatchet.transform(srcData, [BuiltInTransforms.makeDuplicateField('key1', 'key3')]);
    expect(result.key1).toEqual('value1');
    expect(result.key3).toEqual('value1');
  });

  it('should create a new field named key3', function () {
    const result = TransformRatchet.transform(srcData, [BuiltInTransforms.addField('key3', 'value3')]);
    expect(result.key1).toEqual('value1');
    expect(result.key3).toEqual('value3');
  });

  it('should reformat the date in dateField1 to MM-dd-yyyy', function () {
    const result = TransformRatchet.transform(srcData, [BuiltInTransforms.reformatDateFields(['dateKey1'], 'yyyy-MM-dd', 'MM/dd/yyyy')]);
    expect(result.dateKey1).toEqual('02/01/1995');
  });

  it('should convert numbers to booleans', function () {
    const result = TransformRatchet.transform(srcData, [BuiltInTransforms.numberToBool(['intKey1', 'intKey2'])]);
    expect(result.key1).toEqual('value1');
    expect(result.intKey1).toEqual(false);
    expect(result.intKey2).toEqual(true);
  });

  it('should convert booleans to number', function () {
    const result = TransformRatchet.transform(srcData, [BuiltInTransforms.boolToNumber(['boolKey1', 'boolKey2'])]);
    expect(result.key1).toEqual('value1');
    expect(result.boolKey1).toEqual(1);
    expect(result.boolKey2).toEqual(0);
  });

  it('should concatenate key1 and key2 into key3', function () {
    const result = TransformRatchet.transform(srcData, [BuiltInTransforms.concatenateToNewField('key3', ['key1', 'key2'])]);
    expect(result.key1).toBeUndefined();
    expect(result.key2).toBeUndefined();
    expect(result.key3).toEqual('value1value2');
    expect(result.subKey.key1).toBeUndefined();
    expect(result.subKey.key2).toBeUndefined();
    expect(result.subKey.key3).toEqual('subValue1subValue2');
  });

  it('should strip a key correctly', function () {
    const result = TransformRatchet.transform(srcData, [BuiltInTransforms.stripStringTransform('key1')]);
    expect(result.key1).toBeUndefined();
  });

  it('should rename a key correctly', function () {
    const result = TransformRatchet.transform(srcData, [BuiltInTransforms.stringReplaceTransform('key1', 'newKey1')]);
    expect(result.key1).toBeUndefined();
    expect(result.newKey1).toEqual('value1');
    expect(result.subKey.key1).toBeUndefined();
    expect(result.subKey.newKey1).toEqual('subValue1');
  });

  it('should retain only key1 and key2', function () {
    const result = TransformRatchet.transform(srcData, [BuiltInTransforms.keysOnly(BuiltInTransforms.retainAll(['key1', 'key2']))]);
    expect(result.key1).toBeTruthy();
    expect(result.key2).toBeTruthy();
    expect(result.intKey1).toBeUndefined();
    expect(result.boolKey1).toBeUndefined();
    expect(result.subKey).toBeUndefined();
  });

  it('should remove only key1 and key2', function () {
    const result = TransformRatchet.transform(srcData, [BuiltInTransforms.keysOnly(BuiltInTransforms.removeAll(['key1', 'key2']))]);
    expect(result.key1).toBeUndefined();
    expect(result.key2).toBeUndefined();
    expect(result.intKey1).toEqual(0);
    expect(result.boolKey1).toBeTruthy();
    expect(result.subKey).toBeTruthy();
  });

  it('should convert snake to camelcase', function () {
    const result = TransformRatchet.transform(srcUnderData, [BuiltInTransforms.keysOnly(BuiltInTransforms.snakeToCamelCase())]);
    expect(result['new_key_1']).toBeUndefined();
    expect(result['sub_key']).toBeUndefined();
    expect(result.newKey1).toBeTruthy();
    expect(result.subKey).toBeTruthy();
    expect(result.subKey.newKey2).toBeTruthy();
  });

  it('should convert strings to numbers', function () {
    const result = TransformRatchet.transform(srcData, [BuiltInTransforms.valuesOnly(BuiltInTransforms.stringToNumber())]);
    expect(result['convertToNumber']).toEqual(1);
    expect(result['convertToNumberAlso']).toEqual(20);
    expect(result['subKey']['convertToNumberInner']).toEqual(42);
  });
});
