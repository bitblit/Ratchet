import { WardenRecentLoginDescriptor } from './warden-recent-login-descriptor.js';
import { StringRatchet } from '@bitblit/ratchet-common';
import { ErrorRatchet } from '@bitblit/ratchet-common';
import { RequireRatchet } from '@bitblit/ratchet-common';
import { WardenClientAbstractRecentLoginProvider } from './warden-client-abstract-recent-login-provider.js';

export class WardenClientLocalStorageRecentLoginProvider extends WardenClientAbstractRecentLoginProvider {
  constructor(private localStorageKey: string) {
    super();
    RequireRatchet.notNullUndefinedOrOnlyWhitespaceString(this.localStorageKey, 'localStorageKey');
    if (!localStorage) {
      ErrorRatchet.throwFormattedErr('Local storage not available on this platform');
    }
  }

  fetchCache(): WardenRecentLoginDescriptor[] {
    const asString: string = StringRatchet.trimToNull(localStorage.getItem(StringRatchet.trimToNull(this.localStorageKey)));
    return asString ? JSON.parse(asString) : [];
  }

  updateCache(newValue: WardenRecentLoginDescriptor[]) {
    const asString: string = newValue ? JSON.stringify(newValue) : '[]';
    localStorage.setItem(StringRatchet.trimToNull(this.localStorageKey), asString);
  }
}
