import jwt from 'jsonwebtoken';
import { RequireRatchet } from './require-ratchet';
import { Logger } from './logger';
import { StringRatchet } from './string-ratchet';
import { DurationRatchet } from './duration-ratchet';
import { JwtTokenBase } from './jwt-token-base';

/**
 * Functions to help with creating and decoding JWTs
 *
 * JWTRatchet accepts promises for its inputs for the simple reason that best practice dictates that the keys
 * should never be in the code, which means it is likely somewhere else.  That MIGHT be somewhere synchronous
 * like an environmental variable, but it could very likely be someplace remote like a secure key store.  By
 * accepting promises here, we make it easy to do JwtRatchet construction in a place (like an IOT container)
 * that itself must be synchronous
 */
export class JwtRatchet {
  private static readonly EXPIRED_FLAG_NAME: string = '__jwtServiceExpiredFlag';

  constructor(
    private encryptionKeyPromise: Promise<string | string[]>,
    private inDecryptKeysPromise?: Promise<string[]>,
    private jtiGenerator: () => string = StringRatchet.createType4Guid
  ) {
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

  public async decodeToken<T extends JwtTokenBase>(
    payloadString: string,
    expiredHandling: ExpiredJwtHandling = ExpiredJwtHandling.RETURN_NULL
  ): Promise<T> {
    const encKey: string | string[] = await this.encryptionKeyPromise;
    let decKeys: string[] = Array.isArray(encKey) ? encKey : [encKey];
    if (this.inDecryptKeysPromise) {
      decKeys = decKeys.concat(await this.inDecryptKeysPromise);
    }

    const keysTried: string[] = []; //[StringRatchet.obscure(encKey, 1, 1)];
    let payload: T = null; //await JwtRatchet.invalidSafeDecode(payloadString, encKey);

    for (let i = 0; i < decKeys.length && !payload; i++) {
      keysTried.push(StringRatchet.obscure(decKeys[i], 1, 1));
      payload = await JwtRatchet.invalidSafeDecode(payloadString, decKeys[i]);
      if (payload) {
        Logger.debug('Decrypted with key %d', i);
      }
    }

    Logger.debug('Got Payload : %j', payload);
    if (payload) {
      const nowSeconds: number = Math.floor(Date.now() / 1000);
      if ((payload.exp && nowSeconds >= payload.exp) || (payload.nbf && nowSeconds <= payload.nbf)) {
        // Only do this if expiration is defined
        const age: number = nowSeconds - payload.exp;
        Logger.debug('JWT token expired or before NBF : on %d, %s ago', payload.exp, DurationRatchet.formatMsDuration(age));
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

  public async selectRandomEncryptionKey(): Promise<string> {
    const encKey: string | string[] = await this.encryptionKeyPromise;
    const rval: string = Array.isArray(encKey) ? encKey[Math.floor(Math.random() * encKey.length)] : encKey;
    return rval;
  }

  public async createTokenString(payload: any, expirationSeconds?: number, overrideEncryptionKey?: string): Promise<string> {
    const encKey: string = StringRatchet.trimToNull(overrideEncryptionKey)
      ? StringRatchet.trimToNull(overrideEncryptionKey)
      : await this.selectRandomEncryptionKey();

    RequireRatchet.notNullOrUndefined(payload, 'payload');
    payload.jti = this.jtiGenerator ? this.jtiGenerator() : null; // Setup unique code
    if (expirationSeconds) {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const expires = nowSeconds + expirationSeconds;
      Logger.debug('Forcing expiration to %d', expires);
      payload.exp = expires;
    }
    const token: string = jwt.sign(payload, encKey); // , algorithm = 'HS256')
    return token;
  }

  public async refreshJWTString<T>(tokenString: string, allowExpired?: boolean, expirationSeconds?: number): Promise<string> {
    const nowSeconds: number = Math.floor(new Date().getTime() / 1000);
    const handling: ExpiredJwtHandling = allowExpired ? ExpiredJwtHandling.ADD_FLAG : ExpiredJwtHandling.THROW_EXCEPTION;
    const payload: JwtTokenBase = await this.decodeToken(tokenString, handling);

    const originalDurationSeconds: number = payload.exp && payload.iat ? payload.exp - payload.iat : null;
    const newExpirationSeconds: number = expirationSeconds || originalDurationSeconds;
    // Remove any old stuff
    JwtRatchet.removeJwtFields(payload);
    JwtRatchet.removeExpiredFlag(payload); // If it wasnt allowed an exception was thrown above anyway
    const token: string = await this.createTokenString(payload, newExpirationSeconds);
    return token;
  }

  // Helper method that reads the token without checking it, therefore the keys arent needed
  public static decodeTokenNoVerify<T extends JwtTokenBase>(token: string): T {
    return jwt.decode(token) as T;
  }

  // Removes any jwt fields from an object
  public static removeJwtFields(ob: any) {
    if (ob) {
      ['iss', 'sub', 'aud', 'exp', 'nbf', 'iat', 'jti'].forEach((k) => {
        delete ob[k];
      });
    }
  }

  public static removeExpiredFlag(ob: any) {
    if (ob) {
      delete ob[JwtRatchet.EXPIRED_FLAG_NAME];
    }
  }
}

export enum ExpiredJwtHandling {
  RETURN_NULL,
  THROW_EXCEPTION,
  ADD_FLAG,
}
