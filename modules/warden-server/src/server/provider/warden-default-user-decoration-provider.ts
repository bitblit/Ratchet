/**
 * The user details gets jammed into the JWT token upon login.  If one is not provided,
 * the default only puts the WardenEntrySummary in there
 */
import { WardenEntrySummary } from '@bitblit/ratchet-warden-common/common/model/warden-entry-summary';
import { WardenEntry } from '@bitblit/ratchet-warden-common/common/model/warden-entry';
import { WardenUtils } from '@bitblit/ratchet-warden-common/common/util/warden-utils';
import { WardenUserDecoration } from '@bitblit/ratchet-warden-common/common/model/warden-user-decoration';
import { WardenUserDecorationProvider } from './warden-user-decoration-provider.js';

export class WardenDefaultUserDecorationProvider implements WardenUserDecorationProvider<WardenEntrySummary> {
  public async fetchDecoration(wardenUser: WardenEntry): Promise<WardenUserDecoration<WardenEntrySummary>> {
    // Default to 1 hour
    const rval: WardenUserDecoration<WardenEntrySummary> = {
      userTokenData: WardenUtils.stripWardenEntryToSummary(wardenUser),
      proxyUserTokenData: null,
      userTokenExpirationSeconds: 3600,
      globalRoleIds: [],
      teamRoleMappings: [],
    };
    return rval;
  }
}
