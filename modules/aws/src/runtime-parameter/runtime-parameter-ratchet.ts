import { Logger } from '@bitblit/ratchet-common';
import { RequireRatchet } from '@bitblit/ratchet-common';
import { CachedStoredRuntimeParameter } from './cached-stored-runtime-parameter.js';
import { RuntimeParameterProvider } from './runtime-parameter-provider.js';
import { StoredRuntimeParameter } from './stored-runtime-parameter.js';

export class RuntimeParameterRatchet {
  private cache: Map<string, CachedStoredRuntimeParameter> = new Map<string, CachedStoredRuntimeParameter>();

  constructor(private provider: RuntimeParameterProvider) {
    RequireRatchet.notNullOrUndefined(this.provider);
  }

  public async fetchParameter<T>(groupId: string, paramKey: string, defaultValue: T = null, forceFreshRead = false): Promise<T> {
    Logger.debug('Reading parameter %s / %s / Force : %s', groupId, paramKey, forceFreshRead);
    const cached: CachedStoredRuntimeParameter = this.cache.get(RuntimeParameterRatchet.toCacheStoreKey(groupId, paramKey));

    let rval: T = null;
    const now: number = new Date().getTime();
    if (!forceFreshRead && !!cached) {
      const oldest: number = !!cached.ttlSeconds ? now - cached.ttlSeconds * 1000 : 0;
      if (cached.storedEpochMS > oldest) {
        Logger.silly('Fetched %s / %s from cache', groupId, paramKey);
        rval = JSON.parse(cached.paramValue);
      }
    }
    if (!rval) {
      const temp: StoredRuntimeParameter = await this.readUnderlyingEntry(groupId, paramKey);
      if (!!temp) {
        this.addToCache(temp);
        rval = JSON.parse(temp.paramValue);
      }
    }

    rval = rval || defaultValue;

    return rval;
  }

  public async fetchAllParametersForGroup(groupId: string): Promise<Map<string, any>> {
    const all: StoredRuntimeParameter[] = await this.readUnderlyingEntries(groupId);
    const rval: Map<string, any> = new Map<string, any>();
    all.forEach((t) => {
      rval.set(t.paramKey, JSON.parse(t.paramValue));
      this.addToCache(t);
    });
    return rval;
  }

  public async readUnderlyingEntry(groupId: string, paramKey: string): Promise<StoredRuntimeParameter> {
    return this.provider.readParameter(groupId, paramKey);
  }

  public async readUnderlyingEntries(groupId: string): Promise<StoredRuntimeParameter[]> {
    return this.provider.readAllParametersForGroup(groupId);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public async storeParameter(groupId: string, paramKey: string, paramValue: any, ttlSeconds: number): Promise<StoredRuntimeParameter> {
    const toStore: StoredRuntimeParameter = {
      groupId: groupId,
      paramKey: paramKey,
      paramValue: JSON.stringify(paramValue),
      ttlSeconds: ttlSeconds,
    };
    const wrote: boolean = await this.provider.writeParameter(toStore);
    return this.provider.readParameter(groupId, paramKey);
  }
  private static toCacheStoreKey(groupId: string, paramKey: string): string {
    return groupId + ':::' + paramKey;
  }

  private addToCache(temp: StoredRuntimeParameter): void {
    if (!!temp) {
      const now: number = new Date().getTime();
      const toStore: CachedStoredRuntimeParameter = Object.assign({ storedEpochMS: now }, temp);
      this.cache.set(RuntimeParameterRatchet.toCacheStoreKey(temp.groupId, temp.paramKey), toStore);
    }
  }

  public clearCache(): void {
    Logger.debug('Clearing runtime parameter cache');
    this.cache = new Map<string, CachedStoredRuntimeParameter>();
  }
}
