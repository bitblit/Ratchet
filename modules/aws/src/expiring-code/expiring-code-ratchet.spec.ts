import { ExpiringCodeRatchet } from './expiring-code-ratchet.js';
import { ExpiringCode } from './expiring-code.js';
import { expect, test, describe, vi, beforeEach } from 'vitest';

describe('#ExpiringCodeRatchet', () => {
  test('Should generate valid codes', async () => {
    const output: ExpiringCode = ExpiringCodeRatchet.generateCode({ context: 'test', length: 5, timeToLiveSeconds: 10, alphabet: 'A' });
    expect(output.code).toEqual('AAAAA');
  });
});
