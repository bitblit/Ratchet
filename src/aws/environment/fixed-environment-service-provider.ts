import { Logger } from '../../common/logger';
import { RequireRatchet } from '../../common/require-ratchet';
import { EnvironmentServiceProvider } from './environment-service-provider';

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
