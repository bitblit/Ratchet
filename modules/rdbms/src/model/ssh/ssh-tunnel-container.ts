import type { ListenOptions, Server } from 'net';
import type { ConnectConfig, Connection } from 'ssh2';
import * as TunnelSsh from 'tunnel-ssh';

export interface SshTunnelContainer {
  tunnelOptions: TunnelSsh.TunnelOptions;
  serverOptions: ListenOptions;
  sshOptions: ConnectConfig;
  forwardOptions: TunnelSsh.ForwardOptions;
  server: Server;
  connection?: Connection;
}
