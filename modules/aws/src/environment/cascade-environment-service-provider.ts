import { RequireRatchet } from '@bitblit/ratchet-common/lang/require-ratchet';
import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { EnvironmentServiceProvider } from './environment-service-provider.js';

/**
 * Reads a series of providers, returning the first non-null, non-error
 */
export class CascadeEnvironmentServiceProvider<T> implements EnvironmentServiceProvider<T> {
  public constructor(private providers: EnvironmentServiceProvider<T>[]) {
    RequireRatchet.notNullOrUndefined(providers);
    RequireRatchet.true(providers.length > 0);
  }

  public async fetchConfig(name: string): Promise<T> {
    Logger.silly('CascadeEnvironmentServiceProvider fetch for %s', name);
    let rval: T = null;
    for (let i = 0; i < this.providers.length && !rval; i++) {
      try {
        rval = await this.providers[i].fetchConfig(name);
      } catch (err) {
        Logger.error('Provider %d failed - trying next : %s', i, err, err);
        rval = null;
      }
    }

    return rval;
  }
}
