import { WardenRecentLoginDescriptor } from './warden-recent-login-descriptor.js';

import { RequireRatchet } from '@bitblit/ratchet-common/lang/require-ratchet';
import { StringRatchet } from '@bitblit/ratchet-common/lang/string-ratchet';
import { WardenClientAbstractRecentLoginProvider } from './warden-client-abstract-recent-login-provider.js';
import { Logger } from '@bitblit/ratchet-common/logger/logger';

export class WardenClientStorageBasedRecentLoginProvider extends WardenClientAbstractRecentLoginProvider {
  constructor(
    private storageProv: Storage | (() => Storage),
    private storageKey: string,
  ) {
    super();
    RequireRatchet.notNullOrUndefined(this.storageProv, 'storageProv');
    RequireRatchet.notNullUndefinedOrOnlyWhitespaceString(this.storageKey, 'storageKey');
  }

  public get storage(): Storage {
    if (typeof this.storageProv === 'function') {
      return this.storageProv();
    } else {
      return this.storageProv;
    }
  }

  fetchCache(): WardenRecentLoginDescriptor[] {
    const storage: Storage = this.storage;
    if (storage) {
      const asString: string = StringRatchet.trimToNull(storage.getItem(StringRatchet.trimToNull(this.storageKey)));
      return asString ? JSON.parse(asString) : [];
    } else {
      Logger.debug('Tried to fetch cache before storage was ready, returning empty');
      return [];
    }
  }

  updateCache(newValue: WardenRecentLoginDescriptor[]) {
    const storage: Storage = this.storage;
    if (storage) {
      const asString: string = newValue ? JSON.stringify(newValue) : '[]';
      storage.setItem(StringRatchet.trimToNull(this.storageKey), asString);
    } else {
      Logger.debug('Tried to update cache before storage was ready, ignoring update to %j', newValue);
    }
  }
}
