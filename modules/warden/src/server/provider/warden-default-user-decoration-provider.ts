/**
 * The user details gets jammed into the JWT token upon login.  If one is not provided,
 * the default only puts the WardenEntrySummary in there
 */
import { WardenEntry } from '../../common/model/warden-entry';
import { WardenEntrySummary } from '../../common/model/warden-entry-summary';
import { WardenUtils } from '../../common/util/warden-utils';
import { WardenUserDecorationProvider } from './warden-user-decoration-provider';
import { WardenUserDecoration } from '../../common/model/warden-user-decoration';

export class WardenDefaultUserDecorationProvider implements WardenUserDecorationProvider<WardenEntrySummary> {
  public async fetchDecoration(wardenUser: WardenEntry): Promise<WardenUserDecoration<WardenEntrySummary>> {
    // Default to 1 hour
    const rval: WardenUserDecoration<WardenEntrySummary> = {
      userTokenData: WardenUtils.stripWardenEntryToSummary(wardenUser),
      userTokenExpirationSeconds: 3600,
      userTeamRoles: [{ team: 'WARDEN', role: 'USER' }],
    };
    return rval;
  }
}
