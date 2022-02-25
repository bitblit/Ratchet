import jwt from 'jsonwebtoken';
import { RequireRatchet } from './require-ratchet';
import { Logger } from './logger';
import { StringRatchet } from './string-ratchet';
import { DurationRatchet } from './duration-ratchet';

/**
 * Functions to help with creating and decoding JWTs
 */
export class JwtRatchet {
  private static readonly EXPIRED_FLAG_NAME: string = '__jwtServiceExpiredFlag';

  private decryptKeys: string[];

  constructor(private encryptionKey: string, private inDecryptKeys?: string[]) {
    RequireRatchet.notNullOrUndefined(StringRatchet.trimToNull(encryptionKey), 'encryptionKey');
    this.decryptKeys = [encryptionKey];
    if (inDecryptKeys) {
      this.decryptKeys = this.decryptKeys.concat(inDecryptKeys);
    }
  }

  public static hasExpiredFlag(ob: any): boolean {
    return ob && ob[JwtRatchet.EXPIRED_FLAG_NAME] === true;
  }

  public static async invalidSafeDecode<T>(payloadString: string, decryptKey: string): Promise<T> {
    let rval: T = null;
    try {
      rval = jwt.verify(payloadString, decryptKey) as unknown as T;
    } catch (err) {
      Logger.silly('Caught %s - ignoring', err);
    }
    return rval;
  }

  public async decodeToken<T>(payloadString: string, expiredHandling: ExpiredJwtHandling = ExpiredJwtHandling.RETURN_NULL): Promise<T> {
    const keysTried: string[] = [StringRatchet.obscure(this.encryptionKey, 1, 1)];
    let payload: T = await JwtRatchet.invalidSafeDecode(payloadString, this.encryptionKey);

    if (!payload) {
      for (let i = 0; i < this.decryptKeys.length && !payload; i++) {
        keysTried.push(StringRatchet.obscure(this.decryptKeys[i], 1, 1));
        payload = await JwtRatchet.invalidSafeDecode(payloadString, this.decryptKeys[i]);
        if (payload) {
          Logger.debug('Decrypted with historical key %d', i);
        }
      }
    }

    Logger.debug('Got Payload : %j', payload);
    if (payload) {
      const now = new Date().getTime();
      if (!payload['exp'] || now >= payload['exp']) {
        const age: number = now - payload['exp'];
        Logger.debug('JWT token expired : on %d, %s ago', payload['exp'], DurationRatchet.formatMsDuration(age));
        switch (expiredHandling) {
          case ExpiredJwtHandling.THROW_EXCEPTION:
            throw new Error('JWT Token was expired');
          case ExpiredJwtHandling.ADD_FLAG:
            payload[JwtRatchet.EXPIRED_FLAG_NAME] = true;
            break;
          default:
            payload = null;
            break;
        }
      }
    } else {
      Logger.warn('Unable to parse a payload (Tried %j) from : %s', keysTried, payloadString);
    }

    return payload;
  }

  public async createTokenString(payload: any, expirationSeconds?: number, overrideEncryptionKey?: string): Promise<string> {
    RequireRatchet.notNullOrUndefined(payload, 'payload');
    if (expirationSeconds) {
      const now = new Date().getTime();
      const expires = now + expirationSeconds * 1000;
      Logger.debug('Forcing expiration to %d', expires);
      payload['exp'] = expires;
    }
    const token: string = jwt.sign(payload, this.encryptionKey); // , algorithm = 'HS256')
    return token;
  }

  public static decodeTokenNoVerify<T>(token: string): T {
    return jwt.decode(token) as T;
  }
}

export enum ExpiredJwtHandling {
  RETURN_NULL,
  THROW_EXCEPTION,
  ADD_FLAG,
}
