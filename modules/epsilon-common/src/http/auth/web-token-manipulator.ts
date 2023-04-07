/**
 * Service for handling auth tokens
 */

import { JwtTokenBase } from '@bitblit/ratchet-common/jwt/jwt-token-base.js';

export interface WebTokenManipulator<T extends JwtTokenBase> {
  extractTokenFromAuthorizationHeader(header: string): Promise<T>;
}
