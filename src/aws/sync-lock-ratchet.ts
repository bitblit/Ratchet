import { DeleteItemOutput, ExpressionAttributeValueMap, PutItemOutput, ScanInput } from 'aws-sdk/clients/dynamodb';
import { DateTime } from 'luxon';
import { DateRatchet, Logger, RequireRatchet, StringRatchet } from '../common';
import { DynamoRatchet } from './dynamo-ratchet';

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
        const pio: PutItemOutput = await this.ratchet.getDDB().put(params).promise();
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
    if (lockKey) {
      const params = {
        Key: {
          lockingKey: lockKey,
        },
        TableName: this.tableName,
      };

      try {
        const dio: DeleteItemOutput = await this.ratchet.getDDB().delete(params).promise();
        Logger.silly('Released lock %s : %s', lockKey, dio);
      } catch (err) {
        Logger.warn('Failed to release lock key : %s : %s', lockKey, err, err);
      }
    }
  }

  public async clearExpiredSyncLocks(): Promise<number> {
    const nowSeconds: number = Math.floor(new Date().getTime() / 1000);
    const scan: ScanInput = {
      TableName: this.tableName,
      FilterExpression: 'expires < :now',
      ExpressionAttributeValues: {
        ':now': nowSeconds,
      } as ExpressionAttributeValueMap,
    };

    const vals: any[] = await this.ratchet.fullyExecuteScan(scan);

    const removed: number = 0;
    if (vals.length > 0) {
      Logger.info(
        'Deleting %d elements (Now is : %s)',
        vals.length,
        DateTime.fromObject({}, { zone: DateRatchet.PACIFIC_TIME_ZONE }).toFormat(DateRatchet.FULL_DATE_FORMAT)
      );
      for (let i = 0; i < vals.length; i++) {
        try {
          Logger.warn(
            'Removing expired sync lock : %s (expired %s PT)',
            vals[i]['lockingKey'],
            DateTime.fromSeconds(vals[i]['expires'], { zone: DateRatchet.PACIFIC_TIME_ZONE }).toFormat(DateRatchet.FULL_DATE_FORMAT)
          );
          const keys: any = { lockingKey: vals[i]['lockingKey'] };
          await this.ratchet.simpleDelete(this.tableName, keys);
        } catch (err) {
          Logger.error('Failed to remove sync lock : %s : %s', vals[i]['lockingKey'], err, err);
        }
      }
    }

    return removed;
  }
}
