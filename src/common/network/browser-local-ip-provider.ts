import { LocalIpProvider } from './local-ip-provider';
import { NetworkRatchet } from './network-ratchet';
import { Logger } from '../logger';

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

  ready(): boolean {
    return this.currentIp !== 'UNSET';
  }

  currentLocalIpAddress(): string {
    return this.currentIp;
  }
}
