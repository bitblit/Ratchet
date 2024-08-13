import { jwtDecode } from 'jwt-decode';
import { ExpiredJwtHandling } from './expired-jwt-handling.js';
import { JwtTokenBase } from './jwt-token-base.js';
import { JwtPayloadExpirationRatchet } from './jwt-payload-expiration-ratchet.js';

/**
 * This is a stepped-down version of the original JwtRatchet which is
 * now relocated to ratchet-node-only, as it depends on crypto and
 * stream libraries that aren't available in the browser (and common
 * is meant to work on both the browser and node).
 *
 * This can decode a token, and verify expiration, but it can't check
 * the signature since it lacks the libraries (and keys!) for that.
 */
export class JwtDecodeOnlyRatchet {
  public static decodeTokenNoVerify<T extends JwtTokenBase>(
    token: string,
    expiredHandling: ExpiredJwtHandling = ExpiredJwtHandling.RETURN_NULL,
    inDecodeFuntion?: (val: string) => T,
  ): T {
    const decodeFunction: (val: string) => T = inDecodeFuntion ?? jwtDecode;
    let decoded: T = decodeFunction(token);
    decoded = JwtPayloadExpirationRatchet.processPayloadExpiration<T>(decoded, expiredHandling);
    return decoded;
  }
}
