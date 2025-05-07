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

@Injectable({ providedIn: 'root' })
export class LocalStorageService<T> {

  constructor(@Inject(ACUTE_APPLICATION_NAME) private appName: string) {
    RequireRatchet.notNullUndefinedOrOnlyWhitespaceString(appName);
    Logger.debug('Starting local storage with application name %s', this.appName);
  }

  public get storageReady(): boolean {
    return !!storageFinder();
  }

  private get storageName(): string {
    return this.appName+'AcuteLocalStorage';
  }

  public clear(): void {
    this.update({} as T);
  }

  public update(value: T): T {
    if (this.storageReady) {
      const toSave: T = value || ({} as T);
      const saveString: string = JSON.stringify(toSave);
      Logger.info('Updating storage to %s', saveString);
      localStorage.setItem(this.storageName, saveString);
      return toSave;
    } else {
      Logger.info('Skipping update - storage not ready : %j', value);
      return {} as T;
    }
  }

  fetch(): T {
    if (this.storageReady) {
      const loadString: string = localStorage.getItem(this.storageName) || '{}';
      const rval: T = JSON.parse(loadString) as T;
      return rval;
    } else {
      Logger.info('Skipping fetch - storage not ready');
      return {} as T;
    }
  }
  
}
