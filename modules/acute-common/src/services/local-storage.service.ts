import { Injectable } from '@angular/core';
import { Logger } from '@bitblit/ratchet-common/logger/logger';


export function storageFinder(): Storage | null {
  if (typeof window !== 'undefined') {
    if (typeof window.localStorage !=='undefined') {
      return window.localStorage;
    }
  }
  return null;
}

@Injectable({providedIn: 'root'})
export class LocalStorageService<T> {
  private static readonly APP_NAME: string = 'Scribe';

  public get storageReady(): boolean {
    return !!storageFinder();
  }

  public clear(): void {
    this.update({ } as T );
  }

  public update(value: T): T {
    if (this.storageReady) {
      const toSave: T = value || ({} as T);
      const saveString: string = JSON.stringify(toSave);
      Logger.info('Updating storage to %s', saveString);
      localStorage.setItem(LocalStorageService.APP_NAME, saveString);
      return toSave;
    } else {
      Logger.info('Skipping update - storage not ready : %j', value);
      return {} as T;
    }
  }

  fetch(): T {
    if (this.storageReady) {
      const loadString: string = localStorage.getItem(LocalStorageService.APP_NAME) || '{}';
      const rval: T = JSON.parse(loadString) as T;
      return rval;
    } else {
      Logger.info('Skipping fetch - storage not ready');
      return {} as T;
    }
  }

}
