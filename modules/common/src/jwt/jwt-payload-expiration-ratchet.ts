import { ExpiredJwtHandling } from './expired-jwt-handling.js';
import { JwtTokenBase } from './jwt-token-base.js';
import { Logger } from '../logger/logger.js';
import { DurationRatchet } from '../lang/duration-ratchet.js';

export class JwtPayloadExpirationRatchet {
  private static readonly EXPIRED_FLAG_NAME: string = '__jwtServiceExpiredFlag';

  public static processPayloadExpiration<T extends JwtTokenBase>(payload: T, expiredHandling: ExpiredJwtHandling): T {
    if (payload) {
      const nowSeconds: number = Math.floor(Date.now() / 1000);
      // A backwards compatibility hack since some of my old code used to incorrectly write the exp field in milliseconds
      const expSeconds: number = payload?.exp && payload.exp > nowSeconds * 100 ? Math.floor(payload.exp / 1000) : payload?.exp;
      const nbfSeconds: number = payload?.nbf && payload.nbf > nowSeconds * 100 ? Math.floor(payload.nbf / 1000) : payload?.nbf;

      if ((expSeconds && nowSeconds >= expSeconds) || (nbfSeconds && nowSeconds <= nbfSeconds)) {
        // Only do this if expiration is defined
        const age: number = nowSeconds - expSeconds;
        Logger.debug('JWT token expired or before NBF : on %d, %s ago', payload.exp, DurationRatchet.formatMsDuration(age * 1000));
        switch (expiredHandling) {
          case ExpiredJwtHandling.THROW_EXCEPTION:
            throw new Error('JWT Token was expired');
          case ExpiredJwtHandling.ADD_FLAG:
            payload[JwtPayloadExpirationRatchet.EXPIRED_FLAG_NAME] = true;
            break;
          default:
            payload = null;
            break;
        }
      }
    }
    return payload;
  }

  public static hasExpiredFlag(ob: any): boolean {
    return ob && ob[JwtPayloadExpirationRatchet.EXPIRED_FLAG_NAME] === true;
  }

  public static removeExpiredFlag(ob: any) {
    if (ob) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete ob[JwtPayloadExpirationRatchet.EXPIRED_FLAG_NAME];
    }
  }
}
