import { LocalIpProvider } from './local-ip-provider.js';
import { NetworkRatchet } from './network-ratchet.js';
import { Logger } from './logger.js';

export class BrowserLocalIpProvider implements LocalIpProvider {
  private currentIp = 'UNSET';

  constructor() {
    NetworkRatchet.findLocalIp(false)
      .then((result) => {
        Logger.info('Setting local IP to %s', result);
        this.currentIp = result;
      })
      .catch((err) => {
        Logger.warn('Unable to set current IP - leaving as UNSET : %s', err);
      });
  }

  currentLocalIpAddress(): string {
    return this.currentIp;
  }
}
