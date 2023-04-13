import { CommonJwtToken } from '@bitblit/ratchet-common/dist/jwt/common-jwt-token.js';
import { WardenEntrySummary } from './warden-entry-summary.js';

export interface WardenJwtToken<T> extends CommonJwtToken<T> {
  loginData: WardenEntrySummary;
}
