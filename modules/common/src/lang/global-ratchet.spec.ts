import { GlobalRatchet } from './global-ratchet.js';
import { StringRatchet } from './string-ratchet.js';
import { expect, test, describe } from 'vitest';

describe('#globalRatchet', function () {
  test('fetch and set global variables', async () => {
    const tester: string = StringRatchet.createType4Guid();
    const tester2: string = StringRatchet.createType4Guid();
    process.env['GLOBALTEST'] = tester;

    const value: string = GlobalRatchet.fetchGlobalVar('GLOBALTEST');
    expect(value).toEqual(tester);
    GlobalRatchet.setGlobalVar('GLOBALTEST', tester2);
    const value2: string = GlobalRatchet.fetchGlobalVar('GLOBALTEST');
    expect(value2).toEqual(tester2);
  });
});
