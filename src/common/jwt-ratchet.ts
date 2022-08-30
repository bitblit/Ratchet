import jwt from 'jsonwebtoken';
import { RequireRatchet } from './require-ratchet.js';
import { Logger } from './logger.js';
import { StringRatchet } from './string-ratchet.js';
import { DurationRatchet } from './duration-ratchet.js';

/**
 * Functions to help with creating and decoding JWTs
 */
export class JwtRatchet {
  private static readonly EXPIRED_FLAG_NAME: string = '__jwtServiceExpiredFlag';

  constructor(private encryptionKeyPromise: Promise<string>, private inDecryptKeysPromise?: Promise<string[]>) {
    RequireRatchet.notNullOrUndefined(encryptionKeyPromise, 'encryptionKeyPromise');
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
    const encKey: string = await this.encryptionKeyPromise;
    let decKeys: string[] = [encKey];
    if (this.inDecryptKeysPromise) {
      decKeys = decKeys.concat(await this.inDecryptKeysPromise);
    }

    const keysTried: string[] = [StringRatchet.obscure(encKey, 1, 1)];
    let payload: T = await JwtRatchet.invalidSafeDecode(payloadString, encKey);

    if (!payload) {
      for (let i = 0; i < decKeys.length && !payload; i++) {
        keysTried.push(StringRatchet.obscure(decKeys[i], 1, 1));
        payload = await JwtRatchet.invalidSafeDecode(payloadString, decKeys[i]);
        if (payload) {
          Logger.debug('Decrypted with historical key %d', i);
        }
      }
    }

    Logger.debug('Got Payload : %j', payload);
    if (payload) {
      const now = new Date().getTime();
      if (payload['exp'] && now >= payload['exp']) {
        // Only do this if expiration is defined
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
    const encKey: string = await this.encryptionKeyPromise;

    RequireRatchet.notNullOrUndefined(payload, 'payload');
    if (expirationSeconds) {
      const now = new Date().getTime();
      const expires = now + expirationSeconds * 1000;
      Logger.debug('Forcing expiration to %d', expires);
      payload['exp'] = expires;
    }
    const token: string = jwt.sign(payload, encKey); // , algorithm = 'HS256')
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
