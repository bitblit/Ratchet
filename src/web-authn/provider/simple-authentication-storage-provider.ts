import { SimpleAuthenticationEntry } from '../model/simple-authentication-entry';
import { SimpleAuthenticationContactEntry } from '../model/simple-authentication-contact-entry';

/**
 * Classes implementing SimpleAuthenticationStorageProvider perform store and
 * retrieval functions for the SimpleAuthenticationProvider
 */

export interface SimpleAuthenticationStorageProvider {
  readEntryById(userId: string): Promise<SimpleAuthenticationEntry>;
  findEntryByContact(contact: SimpleAuthenticationContactEntry): Promise<SimpleAuthenticationEntry>;
  saveEntry(entry: SimpleAuthenticationEntry): Promise<SimpleAuthenticationEntry>;
  removeEntry(userId: string): Promise<boolean>;

  // User challenges are stored on a per-user, per-rpid basis
  updateUserChallenge(userId: string, relyingPartyId: string, challenge: string): Promise<boolean>;
  fetchCurrentUserChallenge(userId: string, relyingPartyId: string): Promise<string>;
}
