import { WardenEntry } from '../model/warden-entry';
import { WardenContactEntry } from '../model/warden-contact-entry';

/**
 * Classes implementing WardenStorageProvider perform store and
 * retrieval functions for the SimpleAuthenticationProvider
 */

export interface WardenStorageProvider {
  findEntryById(userId: string): Promise<WardenEntry>;
  findEntryByContact(contact: WardenContactEntry): Promise<WardenEntry>;
  saveEntry(entry: WardenEntry): Promise<WardenEntry>;
  removeEntry(userId: string): Promise<boolean>;

  // User challenges are stored on a per-user, per-rpid basis
  updateUserChallenge(userId: string, relyingPartyId: string, challenge: string): Promise<boolean>;
  fetchCurrentUserChallenge(userId: string, relyingPartyId: string): Promise<string>;
}
