import { BrowserLocalIpProvider } from "./browser-local-ip-provider.js";
import { NetworkRatchet } from "./network-ratchet.js";
import { PromiseRatchet } from "../lang/promise-ratchet.js";
import { describe, expect, test, vi } from "vitest";

vi.mock('./network-ratchet');

describe('#browserLocalIpProvider', function () {
  test('should pull a local ip and return it', async () => {
    const mockStaticFn = vi.fn(() => Promise.resolve('192.168.1.1'));

    NetworkRatchet.findLocalIp = mockStaticFn;

    const up: BrowserLocalIpProvider = new BrowserLocalIpProvider();

    // Just here to handle my old stupid not-understanding promises
    while (!up.ready()) {
      await PromiseRatchet.wait(250);
    }

    expect(up.currentLocalIpAddress()).toEqual('192.168.1.1');
  });
});
