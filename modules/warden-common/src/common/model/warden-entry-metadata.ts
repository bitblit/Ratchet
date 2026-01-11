import { WardenEntryMetadataType } from "./warden-entry-metadata-type.ts";

export interface WardenEntryMetadata {
  key: string;
  value: string;
  type: WardenEntryMetadataType;
}
