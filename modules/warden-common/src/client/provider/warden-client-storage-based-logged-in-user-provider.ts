import { WardenLoggedInUserProvider } from './warden-logged-in-user-provider.js';
import { WardenLoggedInUserWrapper } from './warden-logged-in-user-wrapper.js';

import { RequireRatchet } from '@bitblit/ratchet-common/lang/require-ratchet';
import { ErrorRatchet } from '@bitblit/ratchet-common/lang/error-ratchet';
import { StringRatchet } from '@bitblit/ratchet-common/lang/string-ratchet';

export class WardenClientStorageBasedLoggedInUserProvider<T> implements WardenLoggedInUserProvider<T> {
  constructor(private storageProv: Storage | (()=>Storage), private storageKey: string) {
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
      throw ErrorRatchet.fErr('Cannot fetch yet - storage returning null');
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
      throw ErrorRatchet.fErr('Cannot setLoggedInUserWrapper yet - storage returning null');
    }
  }
}
