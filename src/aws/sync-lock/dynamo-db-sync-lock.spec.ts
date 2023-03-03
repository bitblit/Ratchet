import { DynamoDbSyncLock } from './dynamo-db-sync-lock';
import { DynamoRatchet } from '../dynamodb/dynamo-ratchet';
import { Logger } from '../../common/logger';
import { JestRatchet } from '../../jest/jest-ratchet';

let mockDR: jest.Mocked<DynamoRatchet>;

describe('#syncLockService', () => {
  beforeEach(() => {
    mockDR = JestRatchet.mock();
  });

  xit('should test sync locks', async () => {
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

  it('should clear expired sync locks', async () => {
    mockDR.fullyExecuteScan.mockResolvedValue([{ lockingKey: 'aa' }, { lockingKey: 'ab' }]);
    mockDR.deleteAllInBatches.mockResolvedValue(2);

    const svc: DynamoDbSyncLock = new DynamoDbSyncLock(mockDR, 'test-table');

    const res: number = await svc.clearExpiredSyncLocks();
    Logger.info('Got : %s', res);

    expect(res).toEqual(2);
  });
});
