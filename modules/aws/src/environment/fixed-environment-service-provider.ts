import { Logger, RequireRatchet } from '@bitblit/ratchet-common';
import { EnvironmentServiceProvider } from './environment-service-provider.js';
import { injectable } from "tsyringe";

/**
 * Forces in a single object as the environment
 */
@injectable()
export class FixedEnvironmentServiceProvider<T> implements EnvironmentServiceProvider<T> {
  public constructor(private value: Map<string, T>) {
    RequireRatchet.notNullOrUndefined(value);
  }

  public static fromRecord<T>(record: Record<string, T>): FixedEnvironmentServiceProvider<T> {
    const m: Map<string, T> = new Map<string, T>();
    Object.keys(record).forEach((k) => {
      m.set(k, record[k]);
    });
    return new FixedEnvironmentServiceProvider<T>(m);
  }

  public async fetchConfig(name: string): Promise<T> {
    Logger.silly('FixedEnvironmentServiceProvider fetch for %s', name);
    const rval: T = this.value.get(name);
    return rval;
  }
}
