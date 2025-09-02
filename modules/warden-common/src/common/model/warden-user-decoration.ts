import { WardenTeamRoleMapping } from './warden-team-role-mapping.ts';

export interface WardenUserDecoration<T> {
  userTokenData: T;
  proxyUserTokenData: T;
  userTokenExpirationSeconds: number;

  globalRoleIds: string[];
  teamRoleMappings: WardenTeamRoleMapping[];
}
