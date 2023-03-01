import { DynamoCountResult } from './model/dynamo-count-result';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DeleteItemCommandOutput, PutItemOutput } from '@aws-sdk/client-dynamodb';
import { DocQueryCommandInput } from './model/dynamo/doc-query-command-input';
import { DocScanCommandInput } from './model/dynamo/doc-scan-command-input';

export interface DynamoRatchetLike {
  getDDB(): DynamoDBDocumentClient;
  tableIsEmpty(tableName: string): Promise<boolean>;
  // This basically wraps up scans and queries with a function that will auto-retry them if a
  // Throughput exception is encountered (up to a limit) but lets other errors get thrown.
  // Drop-in replacement to make sure that things do not fail just because of throughput issues
  throughputSafeScanOrQuery<T, R>(proc: (T) => Promise<R>, input: T, maxTries?: number, inCurrentTry?: number): Promise<R>;
  fullyExecuteQueryCount(qry: DocQueryCommandInput, delayMS?: number): Promise<DynamoCountResult>;
  fullyExecuteQuery<T>(qry: DocQueryCommandInput, delayMS?: number, softLimit?: number): Promise<T[]>;
  fullyExecuteProcessOverQuery<T>(
    qry: DocQueryCommandInput,
    proc: (val: T) => Promise<void>,
    delayMS?: number,
    softLimit?: number
  ): Promise<number>;

  fullyExecuteScanCount(scan: DocScanCommandInput, delayMS?: number): Promise<DynamoCountResult>;
  fullyExecuteScan<T>(scan: DocScanCommandInput, delayMS?: number, softLimit?: number): Promise<T[]>;
  fullyExecuteProcessOverScan<T>(
    scan: DocScanCommandInput,
    proc: (val: T) => Promise<void>,
    delayMS?: number,
    softLimit?: number
  ): Promise<number>;

  writeAllInBatches<T>(tableName: string, elements: T[], batchSize: number): Promise<number>;
  fetchFullObjectsMatchingKeysOnlyIndexQuery<T>(qry: DocQueryCommandInput, keyNames: string[], batchSize?: number): Promise<T[]>;
  fetchAllInBatches<T>(tableName: string, inKeys: any[], batchSize: number): Promise<T[]>;
  deleteAllInBatches(tableName: string, keys: any[], batchSize: number): Promise<number>;
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  simplePut(tableName: string, value: any, autoRetryCount?: number): Promise<PutItemOutput>;
  simplePutOnlyIfFieldIsNullOrUndefined(tableName: string, value: any, fieldName: string): Promise<boolean>;
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  // This works like simplePut, but if a collision is detected it adjusts the object and tries writing again
  // The adjustment function MUST change one of the keys - otherwise this just runs forever (or until it hits "maxAdjusts")
  simplePutWithCollisionAvoidance<T>(
    tableName: string,
    value: T,
    keyNames: string[],
    adjustFunction: (val: T) => T,
    maxAdjusts?: number,
    autoRetryCount?: number
  ): Promise<T>;
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  simpleGet<T>(tableName: string, keys: any, autoRetryCount?: number): Promise<T>;
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  simpleGetWithCounterDecrement<T>(
    tableName: string,
    keys: any,
    counterAttributeName: string,
    deleteOnZero: boolean,
    autoRetryCount?: number
  ): Promise<T>;
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  simpleDelete(tableName: string, keys: any): Promise<DeleteItemCommandOutput>;
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  atomicCounter(tableName: string, keys: any, counterFieldName: string, increment?: number): Promise<number>;
}
