import { ErrorRatchet } from '@bitblit/ratchet-common/lang/error-ratchet.js';
import { Logger } from '@bitblit/ratchet-common/logger/logger.js';
import { RequireRatchet } from '@bitblit/ratchet-common/lang/require-ratchet.js';
import { StringRatchet } from '@bitblit/ratchet-common/lang/string-ratchet.js';
import { EnvironmentServiceProvider } from './environment-service-provider.js';

/**
 * Service for reading environmental variables
 * Also hides the decryption detail from higher up servicess
 */
export class EnvVarEnvironmentServiceProvider<T> implements EnvironmentServiceProvider<T> {
  public constructor(private envVarName: string) {
    RequireRatchet.notNullOrUndefined(envVarName);
  }

  public async fetchConfig(): Promise<T> {
    Logger.silly('EnvVarEnvironmentServiceProvider fetch for %s', this.envVarName);

    let rval: T = null;
    const src: Record<string, any> = process ? process.env : global ? global : {};
    const toParse: string = StringRatchet.trimToNull(src[this.envVarName]);

    // If we reach here with a string result, try to parse it
    if (toParse) {
      try {
        rval = JSON.parse(toParse);
      } catch (err) {
        Logger.error('Failed to read env - null or invalid JSON : %s : %s', err, toParse, err);
        throw err;
      }
    } else {
      ErrorRatchet.throwFormattedErr('Could not find env var with name : %s', this.envVarName);
    }
    return rval;
  }
}
