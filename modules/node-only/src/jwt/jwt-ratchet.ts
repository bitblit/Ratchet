import { JwtRatchetLike } from './jwt-ratchet-like.js';
import { JwtRatchetConfig } from './jwt-ratchet-config.js';
import jsonwebtoken from 'jsonwebtoken';
import { RequireRatchet } from '@bitblit/ratchet-common/lang/require-ratchet';
import { StringRatchet } from '@bitblit/ratchet-common/lang/string-ratchet';
import { LoggerLevelName } from '@bitblit/ratchet-common/logger/logger-level-name';
import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { JwtPayloadExpirationRatchet } from '@bitblit/ratchet-common/jwt/jwt-payload-expiration-ratchet';
import { JwtTokenBase } from '@bitblit/ratchet-common/jwt/jwt-token-base';
import { ExpiredJwtHandling } from '@bitblit/ratchet-common/jwt/expired-jwt-handling';

/**
 * Functions to help with creating and decoding JWTs
 *
 * JWTRatchet accepts promises for its inputs for the simple reason that best practice dictates that the keys
 * should never be in the code, which means it is likely somewhere else.  That MIGHT be somewhere synchronous
 * like an environmental variable, but it could very likely be someplace remote like a secure key store.  By
 * accepting promises here, we make it easy to do JwtRatchet construction in a place (like an IOT container)
 * that itself must be synchronous
 */
export class JwtRatchet implements JwtRatchetLike {
  constructor(private cfg: JwtRatchetConfig) {
    RequireRatchet.notNullOrUndefined(cfg, 'config');
    RequireRatchet.notNullOrUndefined(cfg.encryptionKeyPromise, 'encryptionKeyPromise');

    cfg.jtiGenerator = cfg.jtiGenerator ?? StringRatchet.createType4Guid;
    cfg.decryptOnlyKeyUseLogLevel = cfg.decryptOnlyKeyUseLogLevel ?? LoggerLevelName.info;
    cfg.parseFailureLogLevel = cfg.parseFailureLogLevel ?? LoggerLevelName.debug;
  }

  public get copyConfig(): JwtRatchetConfig {
    const rval: JwtRatchetConfig = {
      encryptionKeyPromise: this.cfg.encryptionKeyPromise,
      decryptKeysPromise: this.cfg.decryptKeysPromise,
      jtiGenerator: this.cfg.jtiGenerator,
      decryptOnlyKeyUseLogLevel: this.cfg.decryptOnlyKeyUseLogLevel,
      parseFailureLogLevel: this.cfg.parseFailureLogLevel,
    };
    return rval;
  }

  public get encryptionKeyPromise(): Promise<string | string[]> {
    return this.cfg.encryptionKeyPromise;
  }

  public get decryptKeysPromise(): Promise<string[]> {
    return this.cfg.decryptKeysPromise;
  }

  public get jtiGenerator(): () => string {
    return this.cfg.jtiGenerator;
  }

  public get decryptOnlyKeyUseLogLevel(): LoggerLevelName {
    return this.cfg.decryptOnlyKeyUseLogLevel;
  }

  public get parseFailureLogLevel(): LoggerLevelName {
    return this.cfg.parseFailureLogLevel;
  }

  public static async invalidSafeDecode<T>(
    payloadString: string,
    decryptKey: string,
    logLevel: LoggerLevelName = LoggerLevelName.silly,
  ): Promise<T> {
    let rval: T = null;
    try {
      rval = jsonwebtoken.verify(payloadString, decryptKey, { ignoreExpiration: true }) as unknown as T; // We'll check/flag expiration later
    } catch (err) {
      Logger.logByLevel(logLevel, 'Caught %s - ignoring', err);
    }
    return rval;
  }

  public static async secondsRemainingUntilExpiration(payloadString: string): Promise<number> {
    let rval: number = null;
    if (StringRatchet.trimToNull(payloadString)) {
      const output: JwtTokenBase = await JwtRatchet.decodeTokenNoVerify<any>(payloadString);
      const nowSecond: number = Math.floor(Date.now() / 1000);
      if (output.exp) {
        // A backwards compatibility hack since some of my old code used to incorrectly write the exp field in milliseconds
        const expSeconds: number = output.exp > nowSecond * 100 ? Math.floor(output.exp / 1000) : output.exp;
        rval = Math.max(0, expSeconds - nowSecond);
      }
    }
    return rval;
  }

  public static async msRemainingUntilExpiration(payloadString: string): Promise<number> {
    const secs: number = await JwtRatchet.secondsRemainingUntilExpiration(payloadString);
    let rval: number = null;
    if (secs !== null && secs !== undefined) {
      rval = secs * 1000;
    }
    return rval;
  }

  public async decodeToken<T extends JwtTokenBase>(
    payloadString: string,
    expiredHandling: ExpiredJwtHandling = ExpiredJwtHandling.RETURN_NULL,
  ): Promise<T> {
    const encKeys: string[] = await this.encryptionKeyArray();
    let decKeys: string[] = Object.assign([], encKeys);
    if (this.decryptKeysPromise) {
      decKeys = decKeys.concat(await this.decryptKeysPromise);
    }

    const keysTried: string[] = []; //[StringRatchet.obscure(encKey, 1, 1)];
    let payload: T = null; //await JwtRatchet.invalidSafeDecode(payloadString, encKey);

    for (let i = 0; i < decKeys.length && !payload; i++) {
      keysTried.push(StringRatchet.obscure(decKeys[i], 1, 1));
      // Only Log on the last one since it might have just been an old key
      const logLevel: LoggerLevelName =
        i === decKeys.length - 1 && this.parseFailureLogLevel ? this.parseFailureLogLevel : LoggerLevelName.silly;
      payload = await JwtRatchet.invalidSafeDecode(payloadString, decKeys[i], logLevel);
      if (payload && i >= encKeys.length) {
        Logger.logByLevel(this.decryptOnlyKeyUseLogLevel, 'Used old key to decode token : %s', StringRatchet.obscure(decKeys[i], 2));
      }
    }

    if (payload) {
      payload = JwtPayloadExpirationRatchet.processPayloadExpiration(payload, expiredHandling);
    } else {
      Logger.warn('Unable to parse a payload (Tried %j) from : %s', keysTried, payloadString);
    }

    return payload;
  }

  public async encryptionKeyArray(): Promise<string[]> {
    const encKey: string | string[] = await this.encryptionKeyPromise;
    const rval: string[] = Array.isArray(encKey) ? encKey : [encKey];
    if (rval.length < 1) {
      throw new Error('Cannot create JwtRatchet with empty encryption key set');
    }
    return rval;
  }

  public async selectRandomEncryptionKey(): Promise<string> {
    const encKey: string[] = await this.encryptionKeyArray();
    const rval: string = encKey[Math.floor(Math.random() * encKey.length)];
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

    const token: string = jsonwebtoken.sign(payload, encKey); // , algorithm = 'HS256')
    return token;
  }

  public async refreshJWTString(tokenString: string, allowExpired?: boolean, expirationSeconds?: number): Promise<string> {
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

  // Helper method that reads the token without checking it, therefore the keys are not needed
  public static async decodeTokenNoVerify<T extends JwtTokenBase>(token: string): Promise<T> {
    const rval: T = jsonwebtoken.decode(token) as T;
    return rval;
  }

  // Removes any jwt fields from an object
  public static removeJwtFields(ob: any) {
    if (ob) {
      ['iss', 'sub', 'aud', 'exp', 'nbf', 'iat', 'jti'].forEach((k) => {
        // This isn't really dynamic
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete ob[k];
      });
    }
  }

  public static hasExpiredFlag(ob: any): boolean {
    // Delegate for backwards compatibility
    return JwtPayloadExpirationRatchet.hasExpiredFlag(ob);
  }

  public static removeExpiredFlag(ob: any) {
    // Delegate for backwards compatibility
    return JwtPayloadExpirationRatchet.removeExpiredFlag(ob);
  }
}
