import { Logger, RequireRatchet, StringRatchet } from '../common';
import { DynamoRatchet } from './dynamo-ratchet';
import { DeleteItemOutput, PutItemOutput, ScanCommandInput } from '@aws-sdk/client-dynamodb';

export class SyncLockRatchet {
  constructor(private ratchet: DynamoRatchet, private tableName: string) {
    RequireRatchet.notNullOrUndefined(ratchet, 'ratchet');
    RequireRatchet.notNullOrUndefined(StringRatchet.trimToNull(this.tableName), 'tableName');
  }

  public async acquireLock(lockKey: string, expirationSeconds: number = 30): Promise<boolean> {
    let rval: boolean = false;
    if (!!lockKey && !!expirationSeconds) {
      const nowSeconds: number = Math.floor(new Date().getTime() / 1000);
      const row: any = {
        lockingKey: lockKey,
        timestamp: nowSeconds,
        expires: nowSeconds + expirationSeconds,
      };

      const params = {
        Item: row,
        ReturnConsumedCapacity: 'TOTAL',
        TableName: this.tableName,
        ConditionExpression: 'attribute_not_exists(lockingKey)',
      };

      try {
        const pio: PutItemOutput = await this.ratchet.getDDB().put(params);
        rval = true;
      } catch (err) {
        if (String(err).indexOf('ConditionalCheckFailedException') > -1) {
          Logger.silly('Unable to acquire lock on %s', lockKey);
        }
      }
    }

    return rval;
  }

  public async releaseLock(lockKey: string): Promise<void> {
    if (StringRatchet.trimToNull(lockKey)) {
      try {
        const dio: DeleteItemOutput = await this.ratchet.simpleDelete(this.tableName, { lockingKey: lockKey });
        Logger.silly('Released lock %s : %s', lockKey, dio);
      } catch (err) {
        Logger.warn('Failed to release lock key : %s : %s', lockKey, err, err);
      }
    }
  }

  public async clearExpiredSyncLocks(): Promise<number> {
    const nowSeconds: number = Math.floor(new Date().getTime() / 1000);
    const scan: ScanCommandInput = {
      TableName: this.tableName,
      FilterExpression: 'expires < :now',
      ExpressionAttributeValues: DynamoRatchet.jsRecordToDynamoExpressionAttributeValues({
        ':now': nowSeconds,
      }),
    };

    const vals: any[] = await this.ratchet.fullyExecuteScan(scan);
    const keysOnly: any[] = vals.map((v) => {
      const next: any = { lockingKey: v['lockingKey'] };
      return next;
    });
    const removed: number = await this.ratchet.deleteAllInBatches(this.tableName, keysOnly, 25);

    return removed;
  }
}
