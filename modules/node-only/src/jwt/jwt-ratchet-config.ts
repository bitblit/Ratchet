import { LoggerLevelName } from "@bitblit/ratchet-common/logger/logger-level-name";

/**
 * Functions to help with creating and decoding JWTs
 *
 * JWTRatchet accepts promises for its inputs for the simple reason that best practice dictates that the keys
 * should never be in the code, which means it is likely somewhere else.  That MIGHT be somewhere synchronous
 * like an environmental variable, but it could very likely be someplace remote like a secure key store.  By
 * accepting promises here, we make it easy to do JwtRatchet construction in a place (like an IOT container)
 * that itself must be synchronous
 */
export interface JwtRatchetConfig {
  encryptionKeyPromise: Promise<string | string[]>;
  decryptKeysPromise?: Promise<string[]>;
  jtiGenerator?: () => string;
  decryptOnlyKeyUseLogLevel?: LoggerLevelName;
  parseFailureLogLevel?: LoggerLevelName;
}
