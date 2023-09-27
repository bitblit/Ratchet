import { Uint8ArrayRatchet } from './uint-8-array-ratchet';

describe('#Uint8Array', function () {
  it('should combine uint8 arrays', function () {
    const arrayOne: Uint8Array = new Uint8Array([2, 4, 8]);
    const arrayTwo: Uint8Array = new Uint8Array([16, 32, 64]);
    const result: Uint8Array = Uint8ArrayRatchet.mergeArrays([arrayOne, arrayTwo]);
    expect(result).toBeTruthy();
    expect(result.length).toEqual(6);
    expect(result[0]).toEqual(2);
    expect(result[5]).toEqual(64);
  });

  it('should compare arrays', function () {
    const arrayOne: Uint8Array = new Uint8Array([2, 4, 8]);
    const arrayOneX: Uint8Array = new Uint8Array([2, 4, 8]);
    const arrayTwo: Uint8Array = new Uint8Array([16, 32, 64]);
    expect(Uint8ArrayRatchet.deepEqual(arrayOne, arrayTwo)).toBeFalsy();
    expect(Uint8ArrayRatchet.deepEqual(arrayOne, arrayOneX)).toBeTruthy();
  });
});
