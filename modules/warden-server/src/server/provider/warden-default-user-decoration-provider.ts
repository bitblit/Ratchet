/**
 * The user details gets jammed into the JWT token upon login.  If one is not provided,
 * the default only puts the WardenEntrySummary in there
 */
import { WardenEntry, WardenEntrySummary, WardenUserDecoration, WardenUtils } from '@bitblit/ratchet-warden-common';
import { WardenUserDecorationProvider } from './warden-user-decoration-provider';

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
