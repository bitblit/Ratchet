import { DbConfig } from './db-config.js';
import { SshTunnelConfig } from "./ssh/ssh-tunnel-config";

export interface ConnectionConfig {
  dbList: DbConfig[];
  sshTunnelConfig: SshTunnelConfig;
}
