import { WardenLoggedInUserProvider } from './warden-logged-in-user-provider.js';
import { WardenLoggedInUserWrapper } from './warden-logged-in-user-wrapper.js';
import { StringRatchet } from '@bitblit/ratchet-common';
import { ErrorRatchet } from '@bitblit/ratchet-common';
import { RequireRatchet } from '@bitblit/ratchet-common';

export class WardenClientLocalStorageLoggedInUserProvider<T> implements WardenLoggedInUserProvider<T> {
  constructor(private localStorageKey: string) {
    RequireRatchet.notNullUndefinedOrOnlyWhitespaceString(this.localStorageKey, 'localStorageKey');
    if (!localStorage) {
      ErrorRatchet.throwFormattedErr('Local storage not available on this platform');
    }
  }

  public fetchLoggedInUserWrapper(): WardenLoggedInUserWrapper<T> {
    const asString: string = localStorage.getItem(this.localStorageKey);
    const rval: WardenLoggedInUserWrapper<T> = StringRatchet.trimToNull(asString) ? JSON.parse(asString) : null;
    return rval;
  }

  public logOutUser(): void {
    this.setLoggedInUserWrapper(null);
  }

  public setLoggedInUserWrapper(wrapper: WardenLoggedInUserWrapper<T>) {
    if (wrapper) {
      localStorage.setItem(this.localStorageKey, JSON.stringify(wrapper));
    } else {
      localStorage.removeItem(this.localStorageKey);
    }
  }
}
