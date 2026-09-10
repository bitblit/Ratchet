import { RatchetEnvironmentDynamicProperty } from "./ratchet-environment-dynamic-property.ts";

export interface RatchetEnvironmentDatabaseConfig {
  label: string;
  host?: string;
  username?: string;
  password?: string;
  databaseName?: string;
  meta?: RatchetEnvironmentDynamicProperty[];
}