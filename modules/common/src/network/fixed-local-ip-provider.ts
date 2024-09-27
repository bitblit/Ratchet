import { LocalIpProvider } from './local-ip-provider.js';

export class FixedLocalIpProvider implements LocalIpProvider {
  constructor(private fixed: string) {}

  currentLocalIpAddress(): string {
    return this.fixed;
  }
}
