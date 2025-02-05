import { GlobalRatchet } from './global-ratchet.js';
import { StringRatchet } from './string-ratchet.js';
import { describe, expect, test } from 'vitest';

describe('#globalRatchet', function () {
  test('fetch and set global variables', async () => {
    const tester: string = StringRatchet.createType4Guid();
    const tester2: string = StringRatchet.createType4Guid();
    process.env['GLOBALTEST'] = tester;

    const value: string = GlobalRatchet.fetchGlobalEnvVar('GLOBALTEST');
    expect(value).toEqual(tester);
    GlobalRatchet.setGlobalEnvVar('GLOBALTEST', tester2);
    const value2: string = GlobalRatchet.fetchGlobalEnvVar('GLOBALTEST');
    expect(value2).toEqual(tester2);
  });
});
