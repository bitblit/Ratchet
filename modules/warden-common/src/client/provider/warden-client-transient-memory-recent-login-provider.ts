import { WardenRecentLoginDescriptor } from './warden-recent-login-descriptor.js';
import { WardenClientAbstractRecentLoginProvider } from './warden-client-abstract-recent-login-provider.js';

// Stores everything in transient memory - basically just for testing
export class WardenClientTransientMemoryRecentLoginProvider extends WardenClientAbstractRecentLoginProvider {
  private _cache: WardenRecentLoginDescriptor[] = [];

  fetchCache(): WardenRecentLoginDescriptor[] {
    return this._cache;
  }

  updateCache(newValue: WardenRecentLoginDescriptor[]) {
    this._cache = newValue;
  }
}
