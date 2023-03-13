import { WardenEntry } from './warden-entry';
import { WardenTeamRole } from './warden-team-role';

export interface WardenUserDecoration<T> {
  userTokenData: T;
  userTokenExpirationSeconds: number;
  userTeamRoles: WardenTeamRole[];
}
