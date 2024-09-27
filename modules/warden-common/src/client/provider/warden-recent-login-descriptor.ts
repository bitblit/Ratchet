import { WardenEntrySummary } from '../../common/model/warden-entry-summary.js';

export interface WardenRecentLoginDescriptor {
  user: WardenEntrySummary;
  lastLoginEpochMS: number;
}
