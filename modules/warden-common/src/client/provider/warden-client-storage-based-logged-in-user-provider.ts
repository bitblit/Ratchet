import { WardenLoggedInUserProvider } from './warden-logged-in-user-provider.js';
import { WardenLoggedInUserWrapper } from './warden-logged-in-user-wrapper.js';

import { RequireRatchet } from '@bitblit/ratchet-common/lang/require-ratchet';
import { StringRatchet } from '@bitblit/ratchet-common/lang/string-ratchet';
import { Logger } from '@bitblit/ratchet-common/logger/logger';

export class WardenClientStorageBasedLoggedInUserProvider<T> implements WardenLoggedInUserProvider<T> {
  constructor(
    private storageProv: Storage | (() => Storage),
    private storageKey: string,
  ) {
    RequireRatchet.notNullUndefinedOrOnlyWhitespaceString(this.storageKey, 'storageKey');
    RequireRatchet.notNullOrUndefined(this.storageProv, 'storageProv');
  }

  public get storage(): Storage {
    if (typeof this.storageProv === 'function') {
      return this.storageProv();
    } else {
      return this.storageProv;
    }
  }

  public fetchLoggedInUserWrapper(): WardenLoggedInUserWrapper<T> {
    const storage: Storage = this.storage;
    if (storage) {
      const asString: string = storage.getItem(this.storageKey);
      const rval: WardenLoggedInUserWrapper<T> = StringRatchet.trimToNull(asString) ? JSON.parse(asString) : null;
      return rval;
    } else {
      Logger.debug('Tried to fetch logged in user before storage ready - returning null');
      return null;
    }
  }

  public logOutUser(): void {
    this.setLoggedInUserWrapper(null);
  }

  public setLoggedInUserWrapper(wrapper: WardenLoggedInUserWrapper<T>) {
    const storage: Storage = this.storage;
    if (storage) {
      if (wrapper) {
        storage.setItem(this.storageKey, JSON.stringify(wrapper));
      } else {
        storage.removeItem(this.storageKey);
      }
    } else {
      Logger.warn('Tried to set logged in user before storage was ready, ignoring : %j', wrapper);
    }
  }
}
