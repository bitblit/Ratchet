import { ErrorRatchet } from './error-ratchet.js';
import { expect, test, describe } from 'vitest';

describe('#errorRatchet', function () {
  test('should cast to error', async () => {
    const e1: Error = new Error('test1');
    const e2: string = 'test2';

    const e1p: Error = ErrorRatchet.asErr(e1);
    const e2p: Error = ErrorRatchet.asErr(e2);
    const en: Error = ErrorRatchet.asErr(null);

    expect(en).toBeNull();
    expect(e1p).toEqual(e1);
    expect(e2p).not.toEqual(e2);
    expect(e2p instanceof Error).toBeTruthy();
  });

  test('should correctly stringify', async () => {
    const flag: string = 'test1';
    const e1: Error = new Error(flag);
    const out: string = ErrorRatchet.safeStringifyErr(e1);
    expect(out).toEqual(flag);
  });
});
