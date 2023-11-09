/*
    Helper functions for DynamoDB
*/

import {
  BatchGetCommand,
  BatchGetCommandInput,
  BatchGetCommandOutput,
  BatchWriteCommand,
  BatchWriteCommandInput,
  BatchWriteCommandOutput,
  DeleteCommand,
  DeleteCommandInput,
  DeleteCommandOutput,
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandInput,
  GetCommandOutput,
  PutCommand,
  PutCommandInput,
  PutCommandOutput,
  QueryCommand,
  QueryCommandInput,
  QueryCommandOutput,
  ScanCommand,
  ScanCommandInput,
  ScanCommandOutput,
  UpdateCommand,
  UpdateCommandInput,
  UpdateCommandOutput,
} from '@aws-sdk/lib-dynamodb';
import { NativeAttributeValue } from '@aws-sdk/util-dynamodb';
import { RequireRatchet } from '../../common/require-ratchet';
import { ErrorRatchet } from '../../common/error-ratchet';
import { Logger } from '../../common/logger';
import { PromiseRatchet } from '../../common/promise-ratchet';

import { DynamoCountResult } from '../model/dynamo-count-result';
import { DynamoRatchetLike } from './dynamo-ratchet-like';
import { DurationRatchet } from '../../common/duration-ratchet';
import { NumberRatchet } from '../../common/number-ratchet';
import { ConditionalCheckFailedException, ProvisionedThroughputExceededException } from '@aws-sdk/client-dynamodb';

export class DynamoRatchet implements DynamoRatchetLike {
  constructor(private awsDDB: DynamoDBDocumentClient) {
    if (!awsDDB) {
      throw 'awsDDB may not be null';
    }
  }

  public get dynamoDBDocumentClient(): DynamoDBDocumentClient {
    return this.awsDDB;
  }

  public getDDB(): DynamoDBDocumentClient {
    return this.awsDDB;
  }

  public async tableIsEmpty(tableName: string): Promise<boolean> {
    const scan: ScanCommandInput = {
      TableName: tableName,
      Limit: 1,
    };

    const ScanCommandOutput: ScanCommandOutput = await this.throughputSafeScanOrQuery<ScanCommandInput, ScanCommandOutput>(
      (o) => this.scanPromise(o),
      scan,
    );
    return ScanCommandOutput.Items.length === 0;
  }

  // A little pass-thru to simplify passing around this function
  public async scanPromise(input: ScanCommandInput): Promise<ScanCommandOutput> {
    return this.awsDDB.send(new ScanCommand(input));
  }

  // A little pass-thru to simplify passing around this function
  public async queryPromise(input: QueryCommandInput): Promise<QueryCommandOutput> {
    return this.awsDDB.send(new QueryCommand(input));
  }

  // This basically wraps up scans and queries with a function that will auto-retry them if a
  // Throughput exception is encountered (up to a limit) but lets other errors get thrown.
  // Drop-in replacement to make sure that things do not fail just because of throughput issues
  public async throughputSafeScanOrQuery<T, R>(proc: (T) => Promise<R>, input: T, maxTries?: number, inCurrentTry?: number): Promise<R> {
    let rval: R = null;
    if (input) {
      let currentTry: number = inCurrentTry ?? 0;
      do {
        currentTry++;
        try {
          rval = await proc(input);
        } catch (err) {
          if (DynamoRatchet.objectIsErrorWithProvisionedThroughputExceededExceptionCode(err)) {
            const wait: number = Math.pow(2, currentTry) * 1000;
            Logger.debug('Exceeded scan throughput for %j : Try %d of %d (Waiting %d ms)', input, currentTry, maxTries, wait);
            await PromiseRatchet.wait(wait);
            currentTry++;
          } else {
            throw err; // We only catch throughput issues
          }
        }
      } while (!rval && (!maxTries || currentTry < maxTries));
      if (!rval) {
        // We got here because we ran out of tries
        ErrorRatchet.throwFormattedErr(
          'throughputSafeScan failed - tried %d times, kept running into throughput exceeded : %j',
          maxTries,
          input,
        );
      }
    }
    return rval;
  }

  public async fullyExecuteQueryCount(qry: QueryCommandInput, delayMS = 0): Promise<DynamoCountResult> {
    try {
      qry.Select = 'COUNT'; // Force it to be a count query
      Logger.debug('Executing count query : %j', qry);

      const rval: DynamoCountResult = {
        count: 0,
        scannedCount: 0,
        pages: 0,
      };

      const start: number = new Date().getTime();
      let qryResults: QueryCommandOutput = null;

      const myLimit: number = qry.Limit;
      qry.Limit = null;

      do {
        qryResults = await this.throughputSafeScanOrQuery<QueryCommandInput, QueryCommandOutput>((o) => this.queryPromise(o), qry);
        rval.count += qryResults['Count'];
        rval.scannedCount += qryResults['ScannedCount'];
        rval.pages++;
        qry['ExclusiveStartKey'] = qryResults.LastEvaluatedKey;
        await PromiseRatchet.wait(delayMS);
        Logger.silly('Rval is now %j', rval);
        if (myLimit && rval.count >= myLimit && qry['ExclusiveStartKey']) {
          Logger.info('Aborting query since hit limit of %d', myLimit);
          qry['ExclusiveStartKey'] = null;
        }
      } while (qry['ExclusiveStartKey']);

      const end: number = new Date().getTime();

      Logger.debug('Finished, returned %j in %s for %j', rval, DurationRatchet.formatMsDuration(end - start, true), qry);
      return rval;
    } catch (err) {
      Logger.error('Failed with %s, q: %j', err, qry, err);
      return null;
    }
  }

  public async fullyExecuteQuery<T>(qry: QueryCommandInput, delayMS = 0, softLimit: number = null): Promise<T[]> {
    const rval: T[] = [];
    await this.fullyExecuteProcessOverQuery<T>(
      qry,
      async (v) => {
        rval.push(v);
      },
      delayMS,
      softLimit,
    );
    return rval;
  }

  public async fullyExecuteProcessOverQuery<T>(
    qry: QueryCommandInput,
    proc: (val: T) => Promise<void>,
    delayMS = 0,
    softLimit: number = null,
  ): Promise<number> {
    let cnt: number = 0;
    try {
      Logger.debug('Executing query : %j', qry);
      const start: number = new Date().getTime();
      Logger.debug('Pulling %j', qry);

      let qryResults: QueryCommandOutput = await this.throughputSafeScanOrQuery<QueryCommandInput, QueryCommandOutput>(
        (o) => this.queryPromise(o),
        qry,
      );
      for (let i = 0; i < qryResults.Items.length; i++) {
        await proc(qryResults.Items[i] as T);
        cnt++;
      }

      let pages = 0;
      let blankPages = 0;

      while (qryResults.LastEvaluatedKey && (softLimit === null || cnt < softLimit) && !qry.Limit) {
        // If Limit was set on the initial query, stop after 1
        Logger.silly('Found more rows - requery with key %j', qryResults.LastEvaluatedKey);
        qry['ExclusiveStartKey'] = qryResults.LastEvaluatedKey;
        qryResults = await this.throughputSafeScanOrQuery<QueryCommandInput, QueryCommandOutput>((o) => this.queryPromise(o), qry);
        for (let i = 0; i < qryResults.Items.length; i++) {
          await proc(qryResults.Items[i] as T);
          cnt++;
        }
        Logger.silly('Have processed %d items', cnt);
        pages++;
        blankPages += qryResults.Count === 0 ? 1 : 0;
        await PromiseRatchet.wait(delayMS);
      }

      const end: number = new Date().getTime();

      Logger.debug(
        'Finished, processed %d rows in %s for %j (%d blank pages, %d total pages)',
        cnt,
        DurationRatchet.formatMsDuration(end - start, true),
        qry,
        blankPages,
        pages,
      );
    } catch (err) {
      Logger.error('Failed with %s, q: %j', err, qry, err);
    }
    return cnt;
  }

  public async fullyExecuteScanCount(scan: ScanCommandInput, delayMS = 0): Promise<DynamoCountResult> {
    try {
      scan.Select = 'COUNT'; // Force it to be a count query
      const rval: DynamoCountResult = {
        count: 0,
        scannedCount: 0,
        pages: 0,
      };

      Logger.debug('Executing scan count : %j', scan);
      const start: number = new Date().getTime();

      let qryResults: ScanCommandOutput = null;

      const myLimit: number = scan.Limit;
      scan.Limit = null;

      do {
        qryResults = await this.throughputSafeScanOrQuery<ScanCommandInput, ScanCommandOutput>((o) => this.scanPromise(o), scan);
        rval.count += qryResults['Count'];
        rval.scannedCount += qryResults['ScannedCount'];
        rval.pages++;
        scan['ExclusiveStartKey'] = qryResults?.LastEvaluatedKey;
        await PromiseRatchet.wait(delayMS);
        Logger.silly('Rval is now %j', rval);
        if (myLimit && rval.count >= myLimit && scan['ExclusiveStartKey']) {
          Logger.info('Aborting scan since hit limit of %d', myLimit);
          scan['ExclusiveStartKey'] = null;
        }
      } while (scan['ExclusiveStartKey']);

      const end: number = new Date().getTime();

      Logger.debug('Finished, returned %j in %s for %j', rval, DurationRatchet.formatMsDuration(end - start, true), scan);
      return rval;
    } catch (err) {
      Logger.error('Failed with %s, q: %j', err, scan, err);
      return null;
    }
  }

  public async fullyExecuteScan<T>(scan: ScanCommandInput, delayMS = 0, softLimit: number = null): Promise<T[]> {
    const rval: T[] = [];
    await this.fullyExecuteProcessOverScan<T>(
      scan,
      async (v) => {
        rval.push(v);
      },
      delayMS,
      softLimit,
    );
    return rval;
  }

  public async fullyExecuteProcessOverScan<T>(
    scan: ScanCommandInput,
    proc: (val: T) => Promise<void>,
    delayMS = 0,
    softLimit: number = null,
  ): Promise<number> {
    let cnt: number = 0;
    try {
      Logger.debug('Executing scan : %j', scan);
      const start: number = new Date().getTime();

      Logger.debug('Pulling %j', scan);

      let qryResults: ScanCommandOutput = await this.throughputSafeScanOrQuery<ScanCommandInput, ScanCommandOutput>(
        (o) => this.scanPromise(o),
        scan,
      );
      for (let i = 0; i < qryResults.Items.length; i++) {
        await proc(qryResults.Items[i] as T);
        cnt++;
      }

      while (qryResults.LastEvaluatedKey && (softLimit === null || cnt < softLimit) && !scan.Limit) {
        Logger.silly('Found more rows - requery with key %j', qryResults.LastEvaluatedKey);
        scan['ExclusiveStartKey'] = qryResults.LastEvaluatedKey;
        qryResults = await this.throughputSafeScanOrQuery<ScanCommandInput, ScanCommandOutput>((o) => this.scanPromise(o), scan);
        for (let i = 0; i < qryResults.Items.length; i++) {
          await proc(qryResults.Items[i] as T);
          cnt++;
        }
        Logger.silly('Rval is now %d items', cnt);
        await PromiseRatchet.wait(delayMS);
      }

      const end: number = new Date().getTime();

      Logger.debug('Finished, processed %d results in %s for %j', cnt, DurationRatchet.formatMsDuration(end - start, true), scan);
    } catch (err) {
      Logger.error('Failed with %s, q: %j', err, scan, err);
    }
    return cnt;
  }

  public async writeAllInBatches<T>(tableName: string, elements: T[], batchSize: number): Promise<number> {
    if (!batchSize || batchSize < 2) {
      throw new Error('Batch size needs to be at least 2, was ' + batchSize);
    }

    let rval = 0;
    if (!!elements && elements.length > 0) {
      let batchItems: Record<string, any>[] = [];
      elements.forEach((el) => {
        batchItems.push({
          PutRequest: {
            Item: el,
            ReturnConsumedCapacity: 'TOTAL',
            TableName: tableName,
          },
        });
      });
      Logger.debug('Processing %d batch items to %s', batchItems.length, tableName);

      while (batchItems.length > 0) {
        const curBatch: Record<string, any>[] = batchItems.slice(0, Math.min(batchItems.length, batchSize));
        batchItems = batchItems.slice(curBatch.length);
        const params: BatchWriteCommandInput = {
          RequestItems: {},
          ReturnConsumedCapacity: 'TOTAL',
          ReturnItemCollectionMetrics: 'SIZE',
        };
        params.RequestItems[tableName] = curBatch;

        let tryCount = 1;
        let done = false;
        let batchResults: BatchWriteCommandOutput = null;
        while (!done && tryCount < 7) {
          try {
            batchResults = await this.awsDDB.send(new BatchWriteCommand(params));
          } catch (err) {
            if (DynamoRatchet.objectIsErrorWithProvisionedThroughputExceededExceptionCode(err)) {
              Logger.info('Caught ProvisionedThroughputExceededException - retrying delete');
              batchResults = { UnprocessedItems: params.RequestItems } as BatchWriteCommandOutput; // Just retry everything
            } else {
              throw err; // We only retry on throughput
            }
          }
          if (
            !!batchResults &&
            !!batchResults.UnprocessedItems &&
            !!batchResults.UnprocessedItems[tableName] &&
            batchResults.UnprocessedItems[tableName].length > 0
          ) {
            const backoff: number = Math.pow(2, tryCount); // Backoff 2,4,8,16,32 seconds to allow capacity recovery
            Logger.warn(
              'Found %d unprocessed items.  Backing off %d seconds and trying again',
              batchResults.UnprocessedItems[tableName].length,
              backoff,
            );
            await PromiseRatchet.wait(backoff * 1000);
            tryCount++;
            params.RequestItems[tableName] = batchResults.UnprocessedItems[tableName];
          } else {
            done = true;
          }
        }
        if (
          !!batchResults &&
          !!batchResults.UnprocessedItems &&
          !!batchResults.UnprocessedItems[tableName] &&
          batchResults.UnprocessedItems[tableName].length > 0
        ) {
          Logger.error('After 6 tries there were still %d unprocessed items', batchResults.UnprocessedItems[tableName].length);
          rval += curBatch.length - batchResults.UnprocessedItems[tableName].length;
          Logger.warn('FIX Unprocessed : %j', batchResults.UnprocessedItems);
        } else {
          rval += curBatch.length;
        }
      }
    }
    return rval;
  }

  public async fetchFullObjectsMatchingKeysOnlyIndexQuery<T>(
    qry: QueryCommandInput,
    keyNames: string[],
    batchSize: number = 25,
  ): Promise<T[]> {
    RequireRatchet.notNullOrUndefined(qry);
    RequireRatchet.notNullOrUndefined(qry.TableName);
    RequireRatchet.notNullOrUndefined(keyNames);
    RequireRatchet.true(keyNames.length > 0);

    const keyDataSrc: Record<string, any>[] = await this.fullyExecuteQuery<Record<string, any>>(qry);
    const keysOnly: Record<string, any>[] = DynamoRatchet.stripAllToKeysOnly(keyDataSrc, keyNames);
    const rval: T[] = await this.fetchAllInBatches<T>(qry.TableName, keysOnly, batchSize);
    return rval;
  }

  public async fetchAllInBatches<T>(tableName: string, inKeys: Record<string, any>[], batchSize: number): Promise<T[]> {
    if (!batchSize || batchSize < 2 || batchSize > 100) {
      throw new Error('Batch size needs to be at least 2 and no more than 100, was ' + batchSize);
    }

    let rval: T[] = [];
    const batches: BatchGetCommandInput[] = [];
    let remain: Record<string, any>[][] = Object.assign([], inKeys);
    while (remain.length > 0) {
      const curBatch: Record<string, any>[] = remain.slice(0, Math.min(remain.length, batchSize));
      remain = remain.slice(curBatch.length);
      const tableEntry: Record<string, any> = {};
      tableEntry[tableName] = {
        Keys: curBatch,
      };
      const nextBatch: BatchGetCommandInput = {
        RequestItems: tableEntry,
        ReturnConsumedCapacity: 'TOTAL',
      };
      batches.push(nextBatch);
    }
    Logger.debug('Created %d batches', batches.length);

    for (let i = 0; i < batches.length; i++) {
      // No need to log batch count if there's only one.
      if (batches.length > 1) {
        Logger.info('Processing batch %d of %d', i + 1, batches.length);
      }
      const input: BatchGetCommandInput = batches[i];
      let tryCount: number = 1;
      do {
        Logger.silly('Pulling %j', input);
        const res: BatchGetCommandOutput = await this.awsDDB.send(new BatchGetCommand(input));

        // Copy in all the data
        rval = rval.concat(res.Responses[tableName] as T[]);

        // Retry anything we missed
        if (!!res.UnprocessedKeys && !!res.UnprocessedKeys[tableName] && res.UnprocessedKeys[tableName].Keys.length > 0 && tryCount < 15) {
          Logger.silly('Found %d unprocessed, waiting', res.UnprocessedKeys[tableName].Keys);
          await PromiseRatchet.wait(Math.pow(2, tryCount) * 1000);
          tryCount++;
        }
        input.RequestItems = res.UnprocessedKeys;
      } while (!input.RequestItems && input.RequestItems[tableName].Keys.length > 0);
    }
    return rval;
  }

  public async deleteAllInBatches(tableName: string, keys: Record<string, any>[], batchSize: number): Promise<number> {
    if (!batchSize || batchSize < 2) {
      throw new Error('Batch size needs to be at least 2, was ' + batchSize);
    }

    let rval = 0;
    if (!!keys && keys.length > 0) {
      let batchItems: Record<string, any>[] = [];
      keys.forEach((el) => {
        batchItems.push({
          DeleteRequest: {
            Key: el,
            ReturnConsumedCapacity: 'TOTAL',
            TableName: tableName,
          },
        });
      });
      Logger.debug('Processing %d DeleteBatch items to %s', batchItems.length, tableName);

      while (batchItems.length > 0) {
        const curBatch: Record<string, any>[] = batchItems.slice(0, Math.min(batchItems.length, batchSize));
        batchItems = batchItems.slice(curBatch.length);
        const params: BatchWriteCommandInput = {
          RequestItems: {},
          ReturnConsumedCapacity: 'TOTAL',
          ReturnItemCollectionMetrics: 'SIZE',
        };
        params.RequestItems[tableName] = curBatch;

        let tryCount = 1;
        let done = false;
        let batchResults: BatchWriteCommandOutput = null;
        while (!done && tryCount < 7) {
          try {
            batchResults = await this.awsDDB.send(new BatchWriteCommand(params));
          } catch (err) {
            if (DynamoRatchet.objectIsErrorWithProvisionedThroughputExceededExceptionCode(err)) {
              Logger.info('Caught ProvisionedThroughputExceededException - retrying delete');
              batchResults = { UnprocessedItems: params.RequestItems } as BatchWriteCommandOutput; // Just retry everything
            } else {
              throw err; // We only retry on throughput
            }
          }
          if (
            !!batchResults &&
            !!batchResults.UnprocessedItems &&
            !!batchResults.UnprocessedItems[tableName] &&
            batchResults.UnprocessedItems[tableName].length > 0
          ) {
            const backoff: number = Math.pow(2, tryCount); // Backoff 2,4,8,16,32 seconds to allow capacity recovery
            Logger.warn(
              'Found %d unprocessed items.  Backing off %d seconds and trying again',
              batchResults.UnprocessedItems[tableName].length,
              backoff,
            );
            await PromiseRatchet.wait(backoff * 1000);
            tryCount++;
            params.RequestItems[tableName] = batchResults.UnprocessedItems[tableName];
          } else {
            done = true;
          }
        }
        if (
          !!batchResults &&
          !!batchResults.UnprocessedItems &&
          !!batchResults.UnprocessedItems[tableName] &&
          batchResults.UnprocessedItems[tableName].length > 0
        ) {
          Logger.error('After 6 tries there were still %d unprocessed items', batchResults.UnprocessedItems[tableName].length);
          rval += curBatch.length - batchResults.UnprocessedItems[tableName].length;
          Logger.warn('FIX Unprocessed : %j', batchResults.UnprocessedItems);
        } else {
          rval += curBatch.length;
        }

        Logger.debug('%d Remain, DeleteBatch Results : %j', batchItems.length, batchResults);
      }
    }
    return rval;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public async simplePut(tableName: string, value: Record<string, any>, autoRetryCount: number = 3): Promise<PutCommandOutput> {
    let rval: PutCommandOutput = null;
    let currentTry: number = 0;

    const params: PutCommandInput = {
      Item: value,
      ReturnConsumedCapacity: 'TOTAL',
      TableName: tableName,
    };

    while (!rval && currentTry < autoRetryCount) {
      try {
        rval = await this.awsDDB.send(new PutCommand(params));
      } catch (err) {
        if (DynamoRatchet.objectIsErrorWithProvisionedThroughputExceededExceptionCode(err)) {
          const wait: number = Math.pow(2, currentTry) * 1000;
          Logger.debug('Exceeded write throughput for %j : Try %d of %d (Waiting %d ms)', params, currentTry, autoRetryCount, wait);
          await PromiseRatchet.wait(wait);
          currentTry++;
        } else {
          throw err; // We only catch throughput issues
        }
      }
    }
    if (!rval) {
      Logger.warn('Unable to write %j to DDB after %d tries, giving up', params, autoRetryCount);
    }
    return rval;
  }

  public async simplePutOnlyIfFieldIsNullOrUndefined(tableName: string, value: Record<string, any>, fieldName: string): Promise<boolean> {
    let rval: boolean = false;
    const params: PutCommandInput = {
      Item: value,
      ReturnConsumedCapacity: 'TOTAL',
      ConditionExpression: 'attribute_not_exists(#fieldName) OR #fieldName = :null ',
      ExpressionAttributeNames: {
        '#fieldName': fieldName,
      },
      ExpressionAttributeValues: {
        ':null': null,
      },
      TableName: tableName,
    };
    try {
      const wrote: PutCommandOutput = await this.awsDDB.send(new PutCommand(params));
      Logger.silly('Wrote : %j', wrote);
      rval = true;
    } catch (err) {
      if (DynamoRatchet.objectIsErrorWithProvisionedThroughputExceededExceptionCode(err)) {
        // Infinite retry - probably not smart
        Logger.debug('Exceeded write throughput for %j : (Waiting 2000 ms)', params);
        await PromiseRatchet.wait(2000);
        rval = await this.simplePutOnlyIfFieldIsNullOrUndefined(tableName, value, fieldName);
      } else if (err && err instanceof ConditionalCheckFailedException) {
        Logger.debug('Failed to write %j due to null field failure');
        rval = false;
      } else {
        throw err; // We only catch throughput issues
      }
    }
    return rval;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  // This works like simplePut, but if a collision is detected it adjusts the object and tries writing again
  // The adjustment function MUST change one of the keys - otherwise this just runs forever (or until it hits "maxAdjusts")
  public async simplePutWithCollisionAvoidance<T>(
    tableName: string,
    value: T,
    keyNames: string[],
    adjustFunction: (val: T) => T,
    maxAdjusts: number = null,
    autoRetryCount: number = 3,
  ): Promise<T> {
    RequireRatchet.true(keyNames && keyNames.length > 0 && keyNames.length < 3, 'You must pass 1 or 2 key names');
    let pio: PutCommandOutput = null;
    let currentTry: number = 0;

    const attrNames: Record<string, string> = {
      '#key0': keyNames[0],
    };
    const attrValues: Record<string, NativeAttributeValue> = {
      ':key0': value[keyNames[0]],
    };

    let condExp: string = '#key0 <> :key0';
    if (keyNames.length > 1) {
      condExp += ' AND #key1 <> :key1';
      attrNames['#key1'] = keyNames[1];
      attrValues[':key1'] = value[keyNames[1]];
    }

    const params: PutCommandInput = {
      Item: value,
      ReturnConsumedCapacity: 'TOTAL',
      ConditionExpression: condExp,
      ExpressionAttributeNames: attrNames,
      ExpressionAttributeValues: attrValues,
      TableName: tableName,
    };

    let adjustCount: number = 0;
    while (!pio && currentTry < autoRetryCount && (!maxAdjusts || adjustCount < maxAdjusts)) {
      try {
        pio = await this.awsDDB.send(new PutCommand(params));
      } catch (err) {
        if (DynamoRatchet.objectIsErrorWithProvisionedThroughputExceededExceptionCode(err)) {
          currentTry++;
          const wait: number = Math.pow(2, currentTry) * 1000;
          Logger.debug('Exceeded write throughput for %j : Try %d of %d (Waiting %d ms)', params, currentTry, autoRetryCount, wait);
          await PromiseRatchet.wait(wait);
        } else if (err && err instanceof ConditionalCheckFailedException) {
          let newValue: T = Object.assign({}, params.Item) as T;
          Logger.info('Failed to write %j due to collision - adjusting and retrying', newValue);
          newValue = adjustFunction(newValue);
          params.Item = newValue;
          params.ExpressionAttributeValues[':key0'] = newValue[keyNames[0]];
          if (keyNames.length > 1) {
            params.ExpressionAttributeValues[':key1'] = newValue[keyNames[1]];
          }
          adjustCount++;
        } else {
          throw err; // We only catch throughput issues
        }
      }
    }
    if (pio && adjustCount > 0) {
      Logger.info('After adjustment, wrote %j as %j', value, params.Item);
    }

    if (!pio) {
      Logger.warn('Unable to write %j to DDB after %d provision tries and %d adjusts, giving up', params, currentTry, adjustCount);
    }

    return pio ? (params.Item as T) : null;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public async simpleGet<T>(tableName: string, keys: Record<string, any>, autoRetryCount: number = 3): Promise<T> {
    let holder: GetCommandOutput = null;
    let currentTry: number = 0;

    const params: GetCommandInput = {
      TableName: tableName,
      Key: keys,
    };

    while (!holder && currentTry < autoRetryCount) {
      try {
        holder = await this.awsDDB.send(new GetCommand(params));
      } catch (err) {
        if (DynamoRatchet.objectIsErrorWithProvisionedThroughputExceededExceptionCode(err)) {
          const wait: number = Math.pow(2, currentTry) * 1000;
          Logger.debug('Exceeded read throughput for %j : Try %d of %d (Waiting %d ms)', params, currentTry, autoRetryCount, wait);
          await PromiseRatchet.wait(wait);
          currentTry++;
        } else {
          throw err; // We only catch throughput issues
        }
      }
    }
    if (!holder) {
      Logger.warn('Unable to read %j from DDB after %d tries, giving up', params, autoRetryCount);
    }
    const rval: T = !!holder && !!holder.Item ? Object.assign({} as T, holder.Item) : null;
    return rval;
  }

  public static objectIsErrorWithProvisionedThroughputExceededExceptionCode(err: Record<string, any>): boolean {
    return !!err && err instanceof ProvisionedThroughputExceededException;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public async simpleGetWithCounterDecrement<T>(
    tableName: string,
    keys: Record<string, any>,
    counterAttributeName: string,
    deleteOnZero: boolean,
    autoRetryCount: number = 3,
  ): Promise<T> {
    let holder: UpdateCommandOutput = null;
    let currentTry: number = 0;

    const params: UpdateCommandInput = {
      TableName: tableName,
      Key: keys,
      UpdateExpression: 'set #counter = #counter-:decVal',
      ExpressionAttributeNames: {
        '#counter': counterAttributeName,
      },
      ExpressionAttributeValues: {
        ':decVal': 1,
        ':minVal': 0,
      },
      ConditionExpression: '#counter > :minVal',
      ReturnValues: 'ALL_NEW',
    };

    let updateFailed: boolean = false;
    while (!holder && currentTry < autoRetryCount && !updateFailed) {
      try {
        holder = await this.awsDDB.send(new UpdateCommand(params));
      } catch (err) {
        if (DynamoRatchet.objectIsErrorWithProvisionedThroughputExceededExceptionCode(err)) {
          const wait: number = Math.pow(2, currentTry) * 1000;
          Logger.debug('Exceeded update throughput for %j : Try %d of %d (Waiting %d ms)', params, currentTry, autoRetryCount, wait);
          await PromiseRatchet.wait(wait);
          currentTry++;
        } else if (!!err && err instanceof ConditionalCheckFailedException) {
          Logger.info('Cannot fetch requested row (%j) - the update check failed', keys);
          updateFailed = true;
        } else {
          throw err; // We only catch throughput issues
        }
      }
    }
    if (!holder && !updateFailed) {
      Logger.warn('Unable to update %j from DDB after %d tries, giving up', params, autoRetryCount);
    }

    const rval: T = !!holder && !!holder.Attributes ? Object.assign({} as T, holder.Attributes) : null;

    if (deleteOnZero && rval && rval[counterAttributeName] === 0) {
      Logger.info('Delete on 0 specified, removing');
      await this.simpleDelete(tableName, keys);
    }

    return rval;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public async simpleDelete(tableName: string, keys: Record<string, any>): Promise<DeleteCommandOutput> {
    const params: DeleteCommandInput = {
      TableName: tableName,
      Key: keys,
    };

    const holder: DeleteCommandOutput = await this.awsDDB.send(new DeleteCommand(params));
    return holder;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public async atomicCounter(tableName: string, keys: Record<string, any>, counterFieldName: string, increment = 1): Promise<number> {
    const update: UpdateCommandInput = {
      TableName: tableName,
      Key: keys,
      UpdateExpression: 'SET #counterFieldName = #counterFieldName + :inc',
      ExpressionAttributeNames: {
        '#counterFieldName': counterFieldName,
      },
      ExpressionAttributeValues: {
        ':inc': increment,
      },
      ReturnValues: 'UPDATED_NEW',
    };

    const ui: UpdateCommandOutput = await this.awsDDB.send(new UpdateCommand(update));
    const rval: number = NumberRatchet.safeNumber(ui.Attributes[counterFieldName]);
    return rval;
  }

  // Recursively Removes any empty strings in place
  // Here for backwards compatibility - really should just configure your document client the
  // way you want it instead
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public static cleanObject(ob: Record<string, any>): void {
    if (!!ob) {
      const rem: string[] = [];
      Object.keys(ob).forEach((k) => {
        const v: any = ob[k];
        if (v === '') {
          rem.push(k);
        } else if (v instanceof Object) {
          DynamoRatchet.cleanObject(v);
        }
      });
      Logger.silly('Removing keys : %j', rem);
      rem.forEach((k) => {
        delete ob[k];
      });
    }
  }

  // Given an object, deletes anything that isnt part of the key
  public static stripToKeysOnly(input: Record<string, any>, keysNames: string[]): Record<string, any> {
    let rval: Record<string, any> = null;
    if (!!input && !!keysNames && keysNames.length > 0) {
      rval = {};
      keysNames.forEach((k) => {
        if (!input[k]) {
          ErrorRatchet.throwFormattedErr('Failed key extraction on %j - missing %s', input, k);
        }
        rval[k] = input[k];
      });
    }
    return rval;
  }

  public static stripAllToKeysOnly(input: Record<string, any>[], keys: string[]): Record<string, any>[] {
    const rval: Record<string, any>[] = input.map((i) => DynamoRatchet.stripToKeysOnly(i, keys));
    return rval;
  }
}
