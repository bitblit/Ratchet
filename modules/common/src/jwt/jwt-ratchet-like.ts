import { JwtTokenBase } from './jwt-token-base';
import { LoggerLevelName } from '../logger/logger-level-name';
import { ExpiredJwtHandling } from './expired-jwt-handling';

/**
 * Classes implementing this interface have Functions to help with creating and decoding JWTs
 */
export interface JwtRatchetLike {
  get encryptionKeyPromise(): Promise<string | string[]>;
  get decryptKeysPromise(): Promise<string[]>;
  get jtiGenerator(): () => string;
  get decryptOnlyKeyUseLogLevel(): LoggerLevelName;
  get parseFailureLogLevel(): LoggerLevelName;
  decodeToken<T extends JwtTokenBase>(payloadString: string, expiredHandling?: ExpiredJwtHandling): Promise<T>;
  encryptionKeyArray(): Promise<string[]>;
  selectRandomEncryptionKey(): Promise<string>;
  createTokenString(payload: any, expirationSeconds?: number, overrideEncryptionKey?: string): Promise<string>;
  refreshJWTString(tokenString: string, allowExpired?: boolean, expirationSeconds?: number): Promise<string>;
}
