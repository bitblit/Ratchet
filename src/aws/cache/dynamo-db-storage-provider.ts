/*
  Objects implementing this interface can store and retrieve objects in a cache, using a read-thru
  approach.
*/

import { SimpleCacheObjectWrapper } from './simple-cache-object-wrapper.js';
import { SimpleCacheStorageProvider } from './simple-cache-storage-provider.js';
import { RequireRatchet } from '../../common/require-ratchet.js';
import { DynamoRatchet } from '../dynamo-ratchet.js';
import { ExpressionAttributeValueMap, PutItemOutput, QueryInput, ScanInput } from 'aws-sdk/clients/dynamodb';

export class DynamoDbStorageProvider implements SimpleCacheStorageProvider {
  // If hash key is provided, then the cache key is the range, otherwise the cache key is the hash
  constructor(private dynamo: DynamoRatchet, private opts: DynamoDbSimpleCacheOptions) {
    RequireRatchet.notNullOrUndefined(this.dynamo, 'dynamo');
    RequireRatchet.notNullOrUndefined(this.opts, 'opts');
    RequireRatchet.notNullOrUndefined(this.opts.tableName, 'opts.tableName');
    RequireRatchet.notNullOrUndefined(this.opts.hashKeyName, 'opts.hashKeyName');
    RequireRatchet.true(!this.opts.useRangeKeys || (!!this.opts.rangeKeyName && !!this.opts.hashKeyValue), 'invalid range configuration');
  }

  public static createDefaultOptions(): DynamoDbSimpleCacheOptions {
    const rval: DynamoDbSimpleCacheOptions = {
      tableName: 'simple-cache',
      useRangeKeys: false,
      hashKeyName: 'cache-key',
      rangeKeyName: null,
      hashKeyValue: null,
    };
    return rval;
  }

  public createKeyObject(cacheKey: string): any {
    const keys: any = {};
    if (this.opts.useRangeKeys) {
      keys[this.opts.hashKeyName] = this.opts.hashKeyValue;
      keys[this.opts.rangeKeyName] = cacheKey;
    } else {
      keys[this.opts.hashKeyName] = cacheKey;
    }
    return keys;
  }

  public cleanDynamoFieldsFromObjectInPlace(rval: any): void {
    if (rval) {
      delete rval[this.opts.hashKeyName];
      if (this.opts.rangeKeyName) {
        delete rval[this.opts.rangeKeyName];
      }
      if (this.opts.dynamoExpiresColumnName) {
        delete rval[this.opts.dynamoExpiresColumnName];
      }
    }
  }

  public extractKeysFromObject(rval: SimpleCacheObjectWrapper<any>): any {
    let keys: any = null;
    if (rval) {
      keys = {};
      if (this.opts.useRangeKeys) {
        keys[this.opts.hashKeyName] = this.opts.hashKeyValue;
        keys[this.opts.rangeKeyName] = rval.cacheKey;
      } else {
        keys[this.opts.hashKeyName] = rval.cacheKey;
      }
    }
    return keys;
  }

  public async readFromCache<T>(cacheKey: string): Promise<SimpleCacheObjectWrapper<T>> {
    const dKey: any = this.createKeyObject(cacheKey);
    const rval: SimpleCacheObjectWrapper<T> = await this.dynamo.simpleGet<SimpleCacheObjectWrapper<T>>(this.opts.tableName, dKey);
    this.cleanDynamoFieldsFromObjectInPlace(rval);

    return rval;
  }

  public async storeInCache<T>(value: SimpleCacheObjectWrapper<T>): Promise<boolean> {
    RequireRatchet.notNullOrUndefined(value, 'value');
    RequireRatchet.notNullOrUndefined(value.cacheKey, 'value.cacheKey');
    const toSave: any = Object.assign({}, value, this.createKeyObject(value.cacheKey));
    if (this.opts.dynamoExpiresColumnName && value.expiresEpochMS) {
      toSave[this.opts.dynamoExpiresColumnName] = Math.floor(value.expiresEpochMS / 1000);
    }
    const wrote: PutItemOutput = await this.dynamo.simplePut(this.opts.tableName, toSave);
    return !!wrote;
  }

  public async removeFromCache(cacheKey: string): Promise<void> {
    await this.dynamo.simpleDelete(this.opts.tableName, this.createKeyObject(cacheKey));
  }

  public async clearCache(): Promise<number> {
    // This ain't super efficient, I can make it more so later with a projection expression
    const allValues: SimpleCacheObjectWrapper<any>[] = await this.readAll();
    const allKeys: any[] = allValues.map((a) => this.extractKeysFromObject(a));
    const rval: number = await this.dynamo.deleteAllInBatches(this.opts.tableName, allKeys, 25);
    return rval;
  }

  public async readAll(): Promise<SimpleCacheObjectWrapper<any>[]> {
    let rval: SimpleCacheObjectWrapper<any>[] = null;
    if (this.opts.useRangeKeys) {
      const qry: QueryInput = {
        TableName: this.opts.tableName,
        KeyConditionExpression: '#cacheKey = :cacheKey',
        ExpressionAttributeNames: {
          '#cacheKey': this.opts.hashKeyName,
        },
        ExpressionAttributeValues: {
          ':cacheKey': this.opts.hashKeyValue,
        } as ExpressionAttributeValueMap,
      };
      rval = await this.dynamo.fullyExecuteQuery<SimpleCacheObjectWrapper<any>>(qry);
    } else {
      const scan: ScanInput = {
        TableName: this.opts.tableName,
      };
      rval = await this.dynamo.fullyExecuteScan<SimpleCacheObjectWrapper<any>>(scan);
    }
    rval.forEach((r) => this.cleanDynamoFieldsFromObjectInPlace(r));

    return rval;
  }
}

export interface DynamoDbSimpleCacheOptions {
  tableName: string;
  useRangeKeys: boolean;
  hashKeyName: string;
  rangeKeyName?: string;
  hashKeyValue?: string;
  dynamoExpiresColumnName?: string;
}
