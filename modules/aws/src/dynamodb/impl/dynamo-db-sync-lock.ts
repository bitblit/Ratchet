import { RequireRatchet } from "@bitblit/ratchet-common/lang/require-ratchet";
import { Logger } from "@bitblit/ratchet-common/logger/logger";
import { StringRatchet } from "@bitblit/ratchet-common/lang/string-ratchet";
import { DynamoRatchet } from "../dynamo-ratchet.js";
import { DeleteCommandOutput, PutCommand, PutCommandOutput, ScanCommandInput } from "@aws-sdk/lib-dynamodb";
import { SyncLockProvider } from "../../sync-lock/sync-lock-provider.js";
import { ConditionalCheckFailedException, ReturnConsumedCapacity } from "@aws-sdk/client-dynamodb";

export class DynamoDbSyncLock implements SyncLockProvider {
  constructor(
    private ratchet: DynamoRatchet,
    private tableName: string,
  ) {
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
        ReturnConsumedCapacity: ReturnConsumedCapacity.TOTAL,
        TableName: this.tableName,
        ConditionExpression: 'attribute_not_exists(lockingKey)',
      };

      try {
        const _pio: PutCommandOutput = await this.ratchet.getDDB().send(new PutCommand(params));
        rval = true;
      } catch (err) {
        if (err instanceof ConditionalCheckFailedException) {
          Logger.silly('Unable to acquire lock on %s', lockKey);
        }
      }
    }

    return rval;
  }

  public async releaseLock(lockKey: string): Promise<void> {
    if (StringRatchet.trimToNull(lockKey)) {
      try {
        const dio: DeleteCommandOutput = await this.ratchet.simpleDelete(this.tableName, { lockingKey: lockKey });
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
      ExpressionAttributeValues: {
        ':now': nowSeconds,
      },
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
