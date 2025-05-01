import { WardenTeamRole } from "@bitblit/ratchet-warden-common/common/model/warden-team-role";

export class WardenDynamoStorageProviderOptions<T> {
  tableName: string;
  defaultTeamRoles: WardenTeamRole[];
  defaultTokenExpirationSeconds: number;
  defaultDecoration?: T
}
