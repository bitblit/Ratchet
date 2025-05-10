import { Inject, Injectable } from "@angular/core";
import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { ACUTE_APPLICATION_NAME } from "../constants.ts";
import { RequireRatchet } from "@bitblit/ratchet-common/lang/require-ratchet";

/**
 * To use LocalStorageService, you should define a provider with your application
 * name like so:
 *
 * providers: [
 *     { provide: ACUTE_APPLICATION_NAME, useValue: 'yourAppName' }
 *   ]
 */

export function storageFinder(): Storage | null {
  if (typeof window !== 'undefined') {
    if (typeof window.localStorage !== 'undefined') {
      return window.localStorage;
    }
  }
  return null;
}

export function sessionStorageFinder(): Storage | null {
  if (typeof window !== 'undefined') {
    if (typeof window.sessionStorage !== 'undefined') {
      return window.sessionStorage;
    }
  }
  return null;
}


@Injectable({ providedIn: 'root' })
export class LocalStorageService<LocalType, SessionType> {

  constructor(@Inject(ACUTE_APPLICATION_NAME) private appName: string) {
    RequireRatchet.notNullUndefinedOrOnlyWhitespaceString(appName);
    Logger.debug('Starting local storage service with application name %s', this.appName);
  }

  public get storageReady(): boolean {
    return !!storageFinder();
  }

  public get sessionStorageReady(): boolean {
    return !!sessionStorageFinder();
  }

  private get storageName(): string {
    return this.appName+'AcuteLocalStorage';
  }

  public clear(): void {
    this.update({} as LocalType);
  }

  public clearSession(): void {
    this.updateSession({} as SessionType);
  }

  public update(value: LocalType): LocalType {
    return this.updateInternal(value, 'local', storageFinder(), this.storageReady);
  }

  public fetch(): LocalType {
    return this.fetchInternal('local', storageFinder(), this.storageReady);
  }

  public updateSession(value: SessionType): SessionType {
    return this.updateInternal(value, 'session', sessionStorageFinder(), this.sessionStorageReady);
  }

  public fetchSession(): SessionType {
    return this.fetchInternal('session', sessionStorageFinder(), this.sessionStorageReady);
  }

  private updateInternal<T>(value: T, storageLabel: string, storage: Storage, ready: boolean): T {
    if (ready) {
      const toSave: T = value || ({} as T);
      const saveString: string = JSON.stringify(toSave);
      Logger.info('Updating %s to %s',storageLabel,saveString);
      storage.setItem(this.storageName, saveString);
      return toSave;
    } else {
      Logger.info('Skipping update - %s storage not ready : %j', storageLabel, value);
      return {} as T;
    }
  }

  public fetchInternal<T>(storageLabel: string, storage: Storage, ready: boolean): T {
    if (ready) {
      const loadString: string = storage.getItem(this.storageName) || '{}';
      const rval: T = JSON.parse(loadString) as T;
      return rval;
    } else {
      Logger.info('Skipping %s fetch - storage not ready', storageLabel);
      return {} as T;
    }
  }

}
