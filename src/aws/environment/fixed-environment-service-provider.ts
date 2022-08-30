import { Logger } from '../../common/logger.js';
import { RequireRatchet } from '../../common/require-ratchet.js';
import { EnvironmentServiceProvider } from './environment-service-provider.js';

/**
 * Forces in a single object as the environment
 */
export class FixedEnvironmentServiceProvider<T> implements EnvironmentServiceProvider<T> {
  public constructor(private value: Map<string, T>) {
    RequireRatchet.notNullOrUndefined(value);
  }

  public async fetchConfig(name: string): Promise<T> {
    Logger.silly('FixedEnvironmentServiceProvider fetch for %s', name);
    return this.value.get(name);
  }
}
