import { CommonJwtToken } from '@bitblit/ratchet-common/jwt/common-jwt-token';
import { WardenEntrySummary } from './warden-entry-summary.js';
import { WardenTeamRoleMapping } from "./warden-team-role-mapping.ts";

export interface WardenJwtToken<T> extends CommonJwtToken<T> {
  wardenData: WardenEntrySummary;

  // This is built using a combo of the user data that warden tracks, and that the decorator tracks
  // Decorator output goes into the user and proxy fields from commonJwtToken, plus the
  // fields below

  globalRoleIds: string[];
  teamRoleMappings: WardenTeamRoleMapping[];

}
