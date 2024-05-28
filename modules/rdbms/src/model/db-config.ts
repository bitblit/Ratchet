
/*

If the sshTunnel config is set (and valid), the following changes are made
1) A tunnel is opened to the ssh host, with a tunnel from there to the original DB host.
If a local port is specified, it is used, otherwise we grab any open port
2) We modify the db connection as host=localhost, port=local-port
 */

import { SshTunnelConfig } from "./ssh/ssh-tunnel-config";

export interface DbConfig {
  label: string;
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  sshTunnelConfig?: SshTunnelConfig
}
