import { expect } from 'chai';
import { TransformRatchet } from '../../src/common/transform-ratchet';
import { BuiltInTransforms } from '../../src/common/transform/built-in-transforms';

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
    expect(result['dateKey1']).to.be.undefined;
    expect(result['intKey1']).to.be.undefined;
    expect(result['intKey2']).to.be.undefined;
    expect(result['boolKey1']).to.be.undefined;
    expect(result['boolKey2']).to.be.undefined;
    expect(result['subKey']).to.be.undefined;
    expect(result['date_key1']).to.not.be.undefined;
    expect(result['int_key1']).to.not.be.undefined;
    expect(result['int_key2']).to.not.be.undefined;
    expect(result['bool_key1']).to.not.be.undefined;
    expect(result['bool_key1']).to.not.be.undefined;
    expect(result['sub_key']).to.not.be.undefined;
  });

  it('should duplicate key1 into key3', function () {
    const result = TransformRatchet.transform(srcData, [BuiltInTransforms.makeDuplicateField('key1', 'key3')]);
    expect(result.key1).to.equal('value1');
    expect(result.key3).to.equal('value1');
  });

  it('should create a new field named key3', function () {
    const result = TransformRatchet.transform(srcData, [BuiltInTransforms.addField('key3', 'value3')]);
    expect(result.key1).to.equal('value1');
    expect(result.key3).to.equal('value3');
  });

  it('should reformat the date in dateField1 to MM-DD-YYYY', function () {
    const result = TransformRatchet.transform(srcData, [BuiltInTransforms.reformatDateFields(['dateKey1'], 'YYYY-MM-DD', 'MM/DD/YYYY')]);
    expect(result.dateKey1).to.equal('02/01/1995');
  });

  it('should convert numbers to booleans', function () {
    const result = TransformRatchet.transform(srcData, [BuiltInTransforms.numberToBool(['intKey1', 'intKey2'])]);
    expect(result.key1).to.equal('value1');
    expect(result.intKey1).to.equal(false);
    expect(result.intKey2).to.equal(true);
  });

  it('should convert booleans to number', function () {
    const result = TransformRatchet.transform(srcData, [BuiltInTransforms.boolToNumber(['boolKey1', 'boolKey2'])]);
    expect(result.key1).to.equal('value1');
    expect(result.boolKey1).to.equal(1);
    expect(result.boolKey2).to.equal(0);
  });

  it('should concatenate key1 and key2 into key3', function () {
    const result = TransformRatchet.transform(srcData, [BuiltInTransforms.concatenateToNewField('key3', ['key1', 'key2'])]);
    expect(result.key1).to.be.undefined;
    expect(result.key2).to.be.undefined;
    expect(result.key3).to.equal('value1value2');
    expect(result.subKey.key1).to.be.undefined;
    expect(result.subKey.key2).to.be.undefined;
    expect(result.subKey.key3).to.equal('subValue1subValue2');
  });

  it('should strip a key correctly', function () {
    const result = TransformRatchet.transform(srcData, [BuiltInTransforms.stripStringTransform('key1')]);
    expect(result.key1).to.be.undefined;
  });

  it('should rename a key correctly', function () {
    const result = TransformRatchet.transform(srcData, [BuiltInTransforms.stringReplaceTransform('key1', 'newKey1')]);
    expect(result.key1).to.be.undefined;
    expect(result.newKey1).to.equal('value1');
    expect(result.subKey.key1).to.be.undefined;
    expect(result.subKey.newKey1).to.equal('subValue1');
  });

  it('should retain only key1 and key2', function () {
    const result = TransformRatchet.transform(srcData, [BuiltInTransforms.keysOnly(BuiltInTransforms.retainAll(['key1', 'key2']))]);
    expect(result.key1).to.not.be.undefined;
    expect(result.key2).to.not.be.undefined;
    expect(result.intKey1).to.be.undefined;
    expect(result.boolKey1).to.be.undefined;
    expect(result.subKey).to.be.undefined;
  });

  it('should remove only key1 and key2', function () {
    const result = TransformRatchet.transform(srcData, [BuiltInTransforms.keysOnly(BuiltInTransforms.removeAll(['key1', 'key2']))]);
    expect(result.key1).to.be.undefined;
    expect(result.key2).to.be.undefined;
    expect(result.intKey1).to.not.be.undefined;
    expect(result.boolKey1).to.not.be.undefined;
    expect(result.subKey).to.not.be.undefined;
  });

  it('should convert snake to camelcase', function () {
    const result = TransformRatchet.transform(srcUnderData, [BuiltInTransforms.keysOnly(BuiltInTransforms.snakeToCamelCase())]);
    expect(result['new_key_1']).to.be.undefined;
    expect(result['sub_key']).to.be.undefined;
    expect(result.newKey1).to.not.be.undefined;
    expect(result.subKey).to.not.be.undefined;
    expect(result.subKey.newKey2).to.not.be.undefined;
  });

  it('should convert strings to numbers', function () {
    const result = TransformRatchet.transform(srcData, [BuiltInTransforms.valuesOnly(BuiltInTransforms.stringToNumber())]);
    expect(result['convertToNumber']).to.eq(1);
    expect(result['convertToNumberAlso']).to.eq(20);
    expect(result['subKey']['convertToNumberInner']).to.eq(42);
  });
});
