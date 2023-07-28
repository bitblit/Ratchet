import {StringRatchet} from '../../common/string-ratchet.js';
import {SyncLockProvider} from './sync-lock-provider.js';

/**
 * Simple in-memory implementation of the SyncLockProvider interface
 */
export class MemorySyncLock implements SyncLockProvider {
  private _locks: Map<string, number> = new Map<string, number>();

  // Empty constructor prevents instantiation
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  public async acquireLock(lockKey: string, expirationSeconds: number = 30): Promise<boolean> {
    let rval: boolean = false;
    if (StringRatchet.trimToNull(lockKey)) {
      const now: number = Date.now();
      const val: number = this._locks.get(lockKey);
      if (!val || val < now) {
        this._locks.set(lockKey, now + expirationSeconds * 1000);
        rval = true;
      }
    }
    return rval;
  }

  public async releaseLock(lockKey: string): Promise<void> {
    if (StringRatchet.trimToNull(lockKey)) {
      this._locks.delete(lockKey);
    }
  }

  public async clearExpiredSyncLocks(): Promise<number> {
    const toRemove: string[] = [];
    const now: number = Date.now();
    this._locks.forEach((v, k) => {
      if (v < now) {
        toRemove.push(k);
      }
    });
    toRemove.forEach((k) => {
      this._locks.delete(k);
    });
    return toRemove.length;
  }
}
