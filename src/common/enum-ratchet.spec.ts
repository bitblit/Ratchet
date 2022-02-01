import {EnumRatchet} from './enum-ratchet';

describe('#enumRatchet', function () {
  it('should list keys', async () => {
    const keys: string[] = EnumRatchet.listEnumKeys(TestEnum);
    expect(keys).toBeTruthy();
    expect(keys.length).toBeGreaterThan(1);
  });

  it('should find key case insensitive', async () => {
    const t1: TestEnum = EnumRatchet.keyToEnum<TestEnum>(TestEnum, 'a');
    const t2: TestEnum = EnumRatchet.keyToEnum<TestEnum>(TestEnum, 'b');
    const t3: TestEnum = EnumRatchet.keyToEnum<TestEnum>(TestEnum, 'A', true);
    const t4: TestEnum = EnumRatchet.keyToEnum<TestEnum>(TestEnum, 'A');

    const fixed: TestEnum = TestEnum.A;

    expect(t1).toBeTruthy();
    expect(t2).toBeTruthy();
    expect(t3).toBeNull();
    expect(t4).toEqual(fixed);
    expect(t4 === fixed).toBeTruthy();
  });

  it('should parse a csv of enums', async () => {
    const vals: TestEnum[] = EnumRatchet.parseCsvToEnumArray<TestEnum>(TestEnum, 'a, b');
    expect(vals).toBeTruthy();
    expect(vals.length).toEqual(2);
  });
});

export enum TestEnum {
  A = 'a',
  B = 'b',
  C = 'c',
}
