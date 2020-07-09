import { expect } from 'chai';
import { EnumRatchet } from '../../src/common/enum-ratchet';

describe('#enumRatchet', function () {
  it('should list keys', async () => {
    const keys: string[] = EnumRatchet.listEnumKeys(TestEnum);
    expect(keys).to.not.be.null;
    expect(keys.length).to.be.gt(1);
  });

  it('should find key case insensitive', async () => {
    const t1: TestEnum = EnumRatchet.keyToEnum<TestEnum>(TestEnum, 'a');
    const t2: TestEnum = EnumRatchet.keyToEnum<TestEnum>(TestEnum, 'b');
    const t3: TestEnum = EnumRatchet.keyToEnum<TestEnum>(TestEnum, 'A', true);
    const t4: TestEnum = EnumRatchet.keyToEnum<TestEnum>(TestEnum, 'A');

    const fixed: TestEnum = TestEnum.A;

    expect(t1).to.not.be.null;
    expect(t2).to.not.be.null;
    expect(t3).to.be.null;
    expect(t4).to.eq(fixed);
    expect(t4 === fixed).to.be.true;
  });

  it('should parse a csv of enums', async () => {
    const vals: TestEnum[] = EnumRatchet.parseCsvToEnumArray<TestEnum>(TestEnum, 'a, b');
    expect(vals).to.not.be.null;
    expect(vals.length).to.be.eq(2);
  });
});

export enum TestEnum {
  A = 'a',
  B = 'b',
  C = 'c',
}
