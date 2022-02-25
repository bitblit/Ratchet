import { SyncLockRatchet } from './sync-lock-ratchet';
import { DynamoRatchet } from './dynamo-ratchet';
import AWS from 'aws-sdk';
import { Logger } from '../common';

describe('#syncLockService', () => {
  xit('should test sync locks', async () => {
    const svc: SyncLockRatchet = new SyncLockRatchet(
      new DynamoRatchet(new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' })),
      'test-table'
    );

    const lockTestValue: string = 'SYNC_LOCK_TEST';

    const aq1: boolean = await svc.acquireLock(lockTestValue);
    expect(aq1).toBe(true);
    const aq2: boolean = await svc.acquireLock(lockTestValue);
    expect(aq2).toBe(false);
    await svc.releaseLock(lockTestValue);
    const aq3: boolean = await svc.acquireLock(lockTestValue);
    expect(aq3).toBe(true);
    await svc.releaseLock(lockTestValue);
  });

  xit('should clear expired sync locks', async () => {
    process.env['NEON_ENCRYPTION_KEY_NAME'] = 'prod';

    const svc: SyncLockRatchet = new SyncLockRatchet(
      new DynamoRatchet(new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' })),
      'test-table'
    );

    const res: number = await svc.clearExpiredSyncLocks();
    Logger.info('Got : %s', res);

    expect(res).not.toBeUndefined();
  });
});
