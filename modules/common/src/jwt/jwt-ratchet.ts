import { RequireRatchet } from '../lang/require-ratchet.js';
import { Logger } from '../logger/logger.js';
import { StringRatchet } from '../lang/string-ratchet.js';
import { DurationRatchet } from '../lang/duration-ratchet.js';
import { JwtTokenBase } from './jwt-token-base.js';
import { LoggerLevelName } from '../logger/logger-level-name.js';
import { ExpiredJwtHandling } from './expired-jwt-handling.js';
import { JwtRatchetLike } from './jwt-ratchet-like.js';
import { JwtRatchetConfig } from "./jwt-ratchet-config";
import { JwtLibLike } from "./jwt-lib-like";
import { EsmRatchet } from "../lang/esm-ratchet";

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
  private static readonly EXPIRED_FLAG_NAME: string = '__jwtServiceExpiredFlag';

  constructor(private cfg: JwtRatchetConfig
  ) {
    RequireRatchet.notNullOrUndefined(cfg, 'config');
    RequireRatchet.notNullOrUndefined(cfg.encryptionKeyPromise, 'encryptionKeyPromise');

    cfg.jtiGenerator = cfg.jtiGenerator ?? StringRatchet.createType4Guid;
    cfg.decryptOnlyKeyUseLogLevel = cfg.decryptOnlyKeyUseLogLevel ?? LoggerLevelName.info;
    cfg.parseFailureLogLevel = cfg.parseFailureLogLevel ?? LoggerLevelName.debug;
    cfg.jwtLibPromise = cfg.jwtLibPromise ?? JwtRatchet.defaultJsonWebTokenAsJwtLibLike();
  }

  public static defaultJsonWebTokenAsJwtLibLike(): Promise<JwtLibLike> {
    return EsmRatchet.cachedTypedDynamicImport<JwtLibLike>('jsonwebtoken','default', ['verify','sign','decode']);
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

  public static hasExpiredFlag(ob: any): boolean {
    return ob && ob[JwtRatchet.EXPIRED_FLAG_NAME] === true;
  }

  public static async invalidSafeDecode<T>(
    payloadString: string,
    decryptKey: string,
    logLevel: LoggerLevelName = LoggerLevelName.silly,
    jwtLibPromise: Promise<JwtLibLike> = JwtRatchet.defaultJsonWebTokenAsJwtLibLike()
  ): Promise<T> {
    let rval: T = null;
    try {
      const jwtLib = await jwtLibPromise;
      rval = await jwtLib.verify(payloadString, decryptKey, { ignoreExpiration: true }) as unknown as T; // We'll check/flag expiration later
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
    const jwtLib:JwtLibLike = await this.cfg.jwtLibPromise;

    const token: string = await jwtLib.sign(payload, encKey); // , algorithm = 'HS256')
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
  public static async decodeTokenNoVerify<T extends JwtTokenBase>(token: string, jwtLibPromise: Promise<JwtLibLike> = JwtRatchet.defaultJsonWebTokenAsJwtLibLike()): Promise<T> {
    const jwtLib = await jwtLibPromise;
    const rval: T = await jwtLib.decode(token);
    return rval;
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
