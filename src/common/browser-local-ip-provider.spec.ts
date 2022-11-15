import { BrowserLocalIpProvider } from './browser-local-ip-provider';
import { NetworkRatchet } from './network-ratchet';
import { PromiseRatchet } from './promise-ratchet';

jest.mock('./network-ratchet');

describe('#browserLocalIpProvider', function () {
  it('should pull a local ip and return it', async () => {
    const mockStaticFn = jest.fn().mockResolvedValue('192.168.1.1');
    NetworkRatchet.findLocalIp = mockStaticFn;

    const up: BrowserLocalIpProvider = new BrowserLocalIpProvider();

    // Just here to handle my old stupid not-understanding promises
    while (!up.ready()) {
      await PromiseRatchet.wait(250);
    }

    expect(up.currentLocalIpAddress()).toEqual('192.168.1.1');
  });
});
