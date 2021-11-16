import { ExpressionAttributeValueMap, PutItemOutput, ScanInput } from 'aws-sdk/clients/dynamodb';
import { ErrorRatchet, Logger, PromiseRatchet, TimeoutToken } from '../../common';
import { DynamoRatchet } from '../dynamo-ratchet';

export interface GenericCacheRecord<TObject, TUid extends string> {
  cacheUid: TUid;
  cacheObject: TObject;
  updatedEpochSeconds?: number;
  expiresEpochSeconds?: number;
}

export interface GenericCacheReadConfig<TObject, TUid extends string> {
  maximumStalenessSeconds?: number;
  allowNullValue?: boolean;
  cacheValueGeneratorFunction?: () => Promise<GenericCacheRecord<TObject, TUid>>;
}

export class GenericCacheDao<TUid extends string> {
  constructor(private dynamo: DynamoRatchet, private cacheTableName: string) {}

  /**
   * This method writes the input record to the cache, except for the cacheRecord.updatedEpochSeconds value, which is ignored
   */
  public async writeToCache<TObject>(cacheRecord: GenericCacheRecord<TObject, TUid>): Promise<GenericCacheRecord<TObject, TUid>> {
    const toWrite: GenericCacheRecord<TObject, TUid> = {
      cacheUid: cacheRecord.cacheUid,
      cacheObject: cacheRecord.cacheObject,
      updatedEpochSeconds: Math.floor(new Date().getTime() / 1000),
      // default expireTimeEpochSeconds is 10 years from now
      expiresEpochSeconds: cacheRecord.expiresEpochSeconds ?? Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24 * 365 * 10,
    };
    const output: PutItemOutput = await this.dynamo.simplePut(this.cacheTableName, toWrite);
    if (!output) {
      ErrorRatchet.throwFormattedErr('GenericCacheDao : Failed to update %s cache : %j', cacheRecord.cacheUid, cacheRecord.cacheObject);
    }
    const updatedCacheRow: GenericCacheRecord<TObject, TUid> = await this.dynamo.simpleGet<GenericCacheRecord<TObject, TUid>>(
      this.cacheTableName,
      { cacheUid: cacheRecord.cacheUid }
    );
    Logger.info('GenericCacheDao : Successfully updated neon-generic-cache : %s', cacheRecord.cacheUid);

    return updatedCacheRow;
  }

  /**
   * This method either directly returns a cached value or generates a new value with the provided generator
   * function, writes that new value to the cache, then returns the result of that write operation
   */
  public async readFromCache<TObject>(
    cacheUid: TUid,
    config?: GenericCacheReadConfig<TObject, TUid>
  ): Promise<GenericCacheRecord<TObject, TUid>> {
    const cacheValue: GenericCacheRecord<TObject, TUid> = await this.readFromCacheInternal<TObject>(cacheUid);

    if (
      config?.cacheValueGeneratorFunction &&
      (!cacheValue ||
        (config?.maximumStalenessSeconds &&
          !isNaN(new Date(cacheValue.updatedEpochSeconds * 1000).getTime()) &&
          (new Date().getTime() - new Date(cacheValue.updatedEpochSeconds * 1000).getTime()) / 1000 > config?.maximumStalenessSeconds))
    ) {
      const srcPromise: Promise<GenericCacheRecord<TObject, TUid>> = config.cacheValueGeneratorFunction();
      const newCacheValue: GenericCacheRecord<TObject, TUid> | TimeoutToken = await PromiseRatchet.timeout<
        GenericCacheRecord<TObject, TUid>
        >(srcPromise, 'config.cacheValueGeneratorFunction', 10 * 1000);

      if (TimeoutToken.isTimeoutToken(newCacheValue)) {
        ErrorRatchet.throwFormattedErr('GenericCacheDao : cacheValueGeneratorFunction exceeded 10 second time limit');
      }

      if (!!newCacheValue || config?.allowNullValue) {
        return this.writeToCache<TObject>(newCacheValue as GenericCacheRecord<TObject, TUid>);
      } else {
        ErrorRatchet.throwFormattedErr('GenericCacheDao : cannot write null value to cache');
      }
    }

    return cacheValue;
  }

  /**
   * This method reads from the cache and returns the cache value without any other metadata
   */
  public async simpleReadFromCache<TObject>(cacheUid: TUid): Promise<TObject> {
    const cacheValue: GenericCacheRecord<TObject, TUid> = await this.readFromCacheInternal<TObject>(cacheUid);
    return cacheValue.cacheObject;
  }

  /**
   * This method deletes a value from the cache
   */
  public async clearValueFromCache(cacheUid: TUid): Promise<boolean> {
    await this.dynamo.simpleDelete(this.cacheTableName, { cacheUid });
    return true;
  }

  /**
   * This method deletes all values from the cache, or optionally all values older than a maximum staleness
   */
  public async clearAllValuesFromCache<TObject>(maximumStalenessSeconds?: number): Promise<boolean> {
    const scan: ScanInput = {
      TableName: this.cacheTableName,
    };

    if (maximumStalenessSeconds) {
      const maximumStalenessEpochSeconds: number = Math.floor(new Date().getTime() / 1000) - maximumStalenessSeconds;
      scan.ExpressionAttributeValues = { ':maximumStalenessEpochSeconds': maximumStalenessEpochSeconds } as ExpressionAttributeValueMap;
      scan.FilterExpression = 'updatedEpochSeconds < :maximumStalenessEpochSeconds';
    }

    const cacheValues: GenericCacheRecord<TObject, TUid>[] = await this.dynamo.fullyExecuteScan<GenericCacheRecord<TObject, TUid>>(scan);
    const keysToDelete = cacheValues.map((cacheValue) => ({ cacheUid: cacheValue.cacheUid }));

    await this.dynamo.deleteAllInBatches(this.cacheTableName, keysToDelete, 25);
    return true;
  }

  /**
   * This internal helper method reads directly from the dynamoDB cache and returns the cached value or returns null if
   * the returned value is expired
   */
  private async readFromCacheInternal<TObject>(cacheUid: TUid): Promise<GenericCacheRecord<TObject, TUid>> {
    const cacheValue: GenericCacheRecord<TObject, TUid> = await this.dynamo.simpleGet<GenericCacheRecord<TObject, TUid>>(
      this.cacheTableName,
      { cacheUid }
    );

    // check if expired, as AWS sometimes doesn't clean up in time
    if (cacheValue?.expiresEpochSeconds && new Date().getTime() / 1000 - cacheValue?.expiresEpochSeconds > 0) {
      return null;
    }

    return cacheValue;
  }
}
