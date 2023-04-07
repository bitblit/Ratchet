import { WardenRecentLoginDescriptor } from './warden-recent-login-descriptor.js';
import { WardenEntrySummary } from '../../common/model/warden-entry-summary.js';
import { WardenContact } from '../../common/model/warden-contact.js';

export interface WardenClientRecentLoginProvider {
  saveRecentLogin(entry: WardenEntrySummary): void;
  saveNewUser(userId: string, label: string, contact: WardenContact): void;
  removeUser(userId: string): void;
  fetchAllLogins(): WardenRecentLoginDescriptor[];
  clearAllLogins(): void;
}
