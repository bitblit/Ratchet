import { SshTunnelContainer } from './ssh/ssh-tunnel-container.js';

export interface ConnectionAndTunnel<T, R> {
  config: R;
  db: T;
  ssh: SshTunnelContainer;
}
