import { RatchetEnvironmentDynamicProperty } from "./ratchet-environment-dynamic-property.ts";
import { RatchetEnvironmentGenericThirdPartyConfig } from "./ratchet-environment-generic-third-party-config.ts";

export interface RatchetEnvironment {
  encryptionKey?: string;
  historicalDecryptionKeys?: string[];
  database?: RatchetEnvironmentDynamicProperty[];


  otherThirdParty?: RatchetEnvironmentGenericThirdPartyConfig[];
}