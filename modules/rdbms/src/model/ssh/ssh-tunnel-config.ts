export interface SshTunnelConfig {
  forceLocalPort?: number;
  keepAlive: boolean;
  username: string;
  host: string;
  port: number;
  privateKey: string;
}
