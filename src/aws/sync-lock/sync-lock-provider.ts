export interface SyncLockProvider {
  acquireLock(lockKey: string, expirationSeconds?: number): Promise<boolean>;
  releaseLock(lockKey: string): Promise<void>;
  clearExpiredSyncLocks?(): Promise<number>;
}
