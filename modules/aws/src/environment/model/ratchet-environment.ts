import { RatchetEnvironmentDynamicProperty } from "./ratchet-environment-dynamic-property.ts";
import { RatchetEnvironmentThirdPartyConfig } from "./ratchet-environment-third-party-config.ts";

export interface RatchetEnvironment {
  encryptionKey?: string;
  historicalDecryptionKeys?: string[];
  database?: RatchetEnvironmentDynamicProperty[];
  thirdParty?: RatchetEnvironmentThirdPartyConfig[];
}