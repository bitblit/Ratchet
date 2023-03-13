import { WardenRecentLoginDescriptor } from './warden-recent-login-descriptor';
import { WardenEntrySummary } from '../../common/model/warden-entry-summary';
import { WardenContact } from '../../common/model/warden-contact';

export interface WardenClientRecentLoginProvider {
  saveRecentLogin(entry: WardenEntrySummary): void;
  saveNewUser(userId: string, label: string, contact: WardenContact): void;
  removeUser(userId: string): void;
  fetchAllLogins(): WardenRecentLoginDescriptor[];
  clearAllLogins(): void;
}
