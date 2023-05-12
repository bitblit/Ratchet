import { CommonJwtToken } from '@bitblit/ratchet-common';
import { WardenEntrySummary } from './warden-entry-summary.js';

export interface WardenJwtToken<T> extends CommonJwtToken<T> {
  loginData: WardenEntrySummary;
}
