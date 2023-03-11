import { NodeRatchet } from './node-ratchet';

describe('#nodeRatchet', function () {
  xit('fetch env var', async () => {
    const value: string = NodeRatchet.fetchProcessEnvVar('PROGRAMFILES');
    expect(value).not.toBeUndefined();
  });
});
