import { ExpiringCodeRatchet } from './expiring-code-ratchet';
import { ExpiringCode } from './expiring-code';

describe('#ExpiringCodeRatchet', () => {
  it('Should generate valid codes', async () => {
    const output: ExpiringCode = ExpiringCodeRatchet.generateCode({ context: 'test', length: 5, timeToLiveSeconds: 10, alphabet: 'A' });
    expect(output.code).toEqual('AAAAA');
  });
});
