import { SshTunnelContainer } from "./ssh/ssh-tunnel-container";
import { DbConfig } from "./db-config";

export interface ConnectionAndTunnel<T> {
  config: DbConfig;
  db: T;
  ssh: SshTunnelContainer
}
