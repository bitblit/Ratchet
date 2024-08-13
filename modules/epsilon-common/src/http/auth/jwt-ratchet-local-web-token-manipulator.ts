import { WebTokenManipulator } from './web-token-manipulator.js';

import { RequireRatchet } from '@bitblit/ratchet-common/lang/require-ratchet';
import { StringRatchet } from '@bitblit/ratchet-common/lang/string-ratchet';
import { JwtTokenBase } from '@bitblit/ratchet-common/jwt/jwt-token-base';
import { JwtRatchetLike } from '@bitblit/ratchet-node-only/jwt/jwt-ratchet-like';
import { ExpiredJwtHandling } from '@bitblit/ratchet-common/jwt/expired-jwt-handling';

/**
 * Service for handling jwt tokens
 */
export class JwtRatchetLocalWebTokenManipulator<T extends JwtTokenBase> implements WebTokenManipulator<T> {
  constructor(
    private _jwtRatchet: JwtRatchetLike,
    private _issuer: string,
  ) {
    RequireRatchet.notNullOrUndefined(_jwtRatchet, '_jwtRatchet');
    RequireRatchet.notNullOrUndefined(StringRatchet.trimToNull(_issuer), '_issuer');
  }

  public get jwtRatchet(): JwtRatchetLike {
    return this._jwtRatchet;
  }

  public get issuer(): string {
    return this._issuer;
  }

  public async extractTokenFromAuthorizationHeader<T>(header: string): Promise<T> {
    let tokenString: string = StringRatchet.trimToEmpty(header);
    if (tokenString.toLowerCase().startsWith('bearer ')) {
      tokenString = tokenString.substring(7);
    }
    const validated: T = tokenString ? await this.jwtRatchet.decodeToken(tokenString, ExpiredJwtHandling.THROW_EXCEPTION) : null;
    return validated;
  }
}
