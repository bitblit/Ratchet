import { WardenTeamRole } from './warden-team-role.js';

export interface WardenUserDecoration<T> {
  userTokenData: T;
  userTokenExpirationSeconds: number;
  userTeamRoles: WardenTeamRole[];
}
