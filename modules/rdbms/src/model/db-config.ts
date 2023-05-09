export interface DbConfig {
  label: string;
  tunnelPort?: number;
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}
