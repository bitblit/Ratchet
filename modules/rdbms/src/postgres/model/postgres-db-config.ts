import { SshTunnelConfig } from "../../model/ssh/ssh-tunnel-config.ts";
import { Config } from 'pg';

export interface PostgresDbConfig {
  label: string;
  dbConfig: Config;
  sshTunnelConfig?: SshTunnelConfig;
}