import { WardenEntrySummary } from '../../common/model/warden-entry-summary';

export interface WardenRecentLoginDescriptor {
  user: WardenEntrySummary;
  lastLoginEpochMS: number;
}
