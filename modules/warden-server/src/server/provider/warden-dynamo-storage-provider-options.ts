import { WardenTeamRoleMapping } from "@bitblit/ratchet-warden-common/common/model/warden-team-role-mapping";

export class WardenDynamoStorageProviderOptions<T> {
  tableName: string;
  defaultTeamRoleMappings: WardenTeamRoleMapping[];
  defaultTokenExpirationSeconds: number;
  defaultDecoration?: T
}
