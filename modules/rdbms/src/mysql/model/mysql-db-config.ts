import { SshTunnelConfig } from "../../model/ssh/ssh-tunnel-config.js";

export interface MysqlDbConfig{
  label: string;
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  sshTunnelConfig?: SshTunnelConfig

  ssl?: string | Record<string, any>;
  decimalNumbers?: boolean;
}
