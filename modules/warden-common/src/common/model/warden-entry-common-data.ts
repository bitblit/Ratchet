import { WardenTeamRoleMapping } from "./warden-team-role-mapping.ts";
import { WardenContact } from "./warden-contact.ts";
import { WardenEntryMetadata } from "./warden-entry-metadata.ts";

export interface WardenEntryCommonData {
  userId: string;
  userLabel: string; // Usually full name, could be something else
  contactMethods: WardenContact[];
  meta: WardenEntryMetadata[];

  globalRoleIds: string[];
  teamRoleMappings: WardenTeamRoleMapping[];
}
