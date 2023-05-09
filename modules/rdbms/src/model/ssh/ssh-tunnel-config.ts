export interface SshTunnelConfig {
  keepAlive: boolean;
  username: string;
  host: string;
  port: number;
  privateKey: string;
}
