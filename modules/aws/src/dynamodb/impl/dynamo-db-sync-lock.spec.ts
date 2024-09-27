import { DynamoDbSyncLock } from './dynamo-db-sync-lock.js';
import { DynamoRatchet } from '../dynamo-ratchet.js';
import { Logger } from '@bitblit/ratchet-common/logger/logger';

import { beforeEach, describe, expect, test } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';

let mockDR: MockProxy<DynamoRatchet>;

describe('#syncLockService', () => {
  beforeEach(() => {
    mockDR = mock<DynamoRatchet>();
  });

  test.skip('should test sync locks', async () => {
    const svc: DynamoDbSyncLock = new DynamoDbSyncLock(mockDR, 'test-table');

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

  test('should clear expired sync locks', async () => {
    mockDR.fullyExecuteScan.mockResolvedValue([{ lockingKey: 'aa' }, { lockingKey: 'ab' }]);
    mockDR.deleteAllInBatches.mockResolvedValue(2);

    const svc: DynamoDbSyncLock = new DynamoDbSyncLock(mockDR, 'test-table');

    const res: number = await svc.clearExpiredSyncLocks();
    Logger.info('Got : %s', res);

    expect(res).toEqual(2);
  });
});
