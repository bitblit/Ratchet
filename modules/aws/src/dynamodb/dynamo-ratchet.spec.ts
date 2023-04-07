import { DynamoRatchet } from './dynamo-ratchet.js';
import { Logger } from '@bitblit/ratchet-common/logger/logger.js';
import { LoggerLevelName } from '@bitblit/ratchet-common/logger/logger-level-name.js';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { PutItemCommandOutput, ScanCommandInput } from '@aws-sdk/client-dynamodb';
import { DocQueryCommandInput } from '../model/dynamo/doc-query-command-input.js';

import { mockClient } from 'aws-sdk-client-mock';

let mockDynamo;

describe('#dynamoRatchet', function () {
  mockDynamo = mockClient(DynamoDBDocumentClient);

  beforeEach(() => {
    mockDynamo.reset();
  });

  xit('should handle ProvisionedThroughputExceeded exceptions', async () => {
    const dr: DynamoRatchet = new DynamoRatchet(mockDynamo);
    let row: number = 0;
    const scan: ScanCommandInput = {
      TableName: 'cache-device-data',
      ProjectionExpression: 'compositeKey',
    };

    Logger.info('Starting scan');
    const cnt: number = await dr.fullyExecuteProcessOverScan<any>(scan, async (ob) => {
      if (row % 100 === 0) {
        Logger.info('Row : %d : %j', row, ob);
      }
      row++;
    });

    Logger.info('Count was : %d', cnt);
  }, 300_000_000);

  xit('should only write if a field is null', async () => {
    const dr: DynamoRatchet = new DynamoRatchet(mockDynamo);
    const tableName: string = 'some-table';

    const test1: any = { lockingKey: 'aaa', xx: null };
    await dr.simplePut(tableName, test1);

    const test2: any = { lockingKey: 'aaa', xx: 5 };
    const val1: boolean = await dr.simplePutOnlyIfFieldIsNullOrUndefined(tableName, test2, 'xx');

    expect(val1).toBeTruthy();

    const test3: any = { lockingKey: 'aaa', xx: 7 };
    const val2: boolean = await dr.simplePutOnlyIfFieldIsNullOrUndefined(tableName, test3, 'xx');

    expect(val2).toBeFalsy();
  });

  xit('should fetch items from a key-only index query', async () => {
    const dr: DynamoRatchet = new DynamoRatchet(mockDynamo);
    const tableName: string = 'some-table';
    const limit: number = 200;

    const qry: DocQueryCommandInput = {
      TableName: tableName,
      IndexName: 'purchaseId-notBeforeEpochMS-index',
      KeyConditionExpression: 'purchaseId = :purchaseId',
      Limit: limit,
      ExpressionAttributeValues: {
        ':purchaseId': 'some-purchase',
      },
    };

    const res: any[] = await dr.fetchFullObjectsMatchingKeysOnlyIndexQuery(qry, ['key1', 'key2']);

    Logger.info('Got : %s', res);
    expect(res).toBeTruthy();
  });

  xit('should increment the counter and return the new value', async () => {
    const dr: DynamoRatchet = new DynamoRatchet(mockDynamo);
    const tableName: string = 'xxx';
    const res: number = await dr.atomicCounter(tableName, { groupId: 'global', unitId: 'sequence' }, 'lastValue', 1);
    Logger.info('Got : %s', res);
    expect(res).toBeTruthy();
  });

  xit('should stop after the soft limit', async () => {
    const dr: DynamoRatchet = new DynamoRatchet(mockDynamo);

    const now: number = new Date().getTime();
    const nowSec: number = Math.floor(now / 1000);
    const curHash: string = 'someHash';

    const qry: DocQueryCommandInput = {
      TableName: 'some-table',
      KeyConditionExpression: 'hashVal = :hashVal',
      ExpressionAttributeValues: {
        ':hashVal': curHash,
      },
    };

    const res: any[] = await dr.fullyExecuteQuery<any>(qry, null, 150);

    Logger.info('Got : %s', res);
    expect(res).toBeTruthy();
  }, 300_000);

  xit('should run an insert / read test for slowdown', async () => {
    const dr: DynamoRatchet = new DynamoRatchet(mockDynamo);

    Logger.setLevel(LoggerLevelName.debug);
    const now: number = new Date().getTime();
    const nowSec: number = Math.floor(now / 1000);

    const nums: any[] = [];
    for (let i = 0; i < 300; i++) {
      const toWrite: any = {
        id: 'CW_DDB_TEST',
        data: 'SOME DATA',
        numData: i,
      };
      nums.push(toWrite);
    }
    Logger.info('About to start');
    const writeProms: Promise<any>[] = nums.map((n) => dr.simplePut('some-table', n));
    const writeOut: any[] = await Promise.all(writeProms);
    Logger.info('Write : %j', writeOut);

    const readProms: Promise<any>[] = [];
    Logger.info('Start : %d', new Date().getTime());
    for (let i = 0; i < 10000; i++) {
      readProms.push(dr.simpleGet('some-table', { id: 'CW_DDB_TEST' }));
    }
    Logger.info('Mid : %d', new Date().getTime());
    const readOut: any[] = await Promise.all(readProms);
    Logger.info('Read : %d : %j', new Date().getTime(), readOut);
  });

  xit('should run a collision test', async () => {
    const dr: DynamoRatchet = new DynamoRatchet(mockDynamo);

    Logger.setLevel(LoggerLevelName.debug);

    const val: any = {
      k1: 'abc',
      k2: 1,
    };

    for (let i = 0; i < 5; i++) {
      const rval: PutItemCommandOutput = await dr.simplePutWithCollisionAvoidance(
        'cwtest',
        val,
        ['k1', 'k2'],
        (v) => {
          v.k2++;
          return v;
        },
        null,
        3
      );
      Logger.info('output was : %j', rval);
    }
  });

  xit('should do a simple get with counter decrement', async () => {
    const dr: DynamoRatchet = new DynamoRatchet(mockDynamo);

    Logger.setLevel(LoggerLevelName.debug);

    const v: any = await dr.simpleGetWithCounterDecrement<any>('cwtest', { k1: 'abc', k2: 11 }, 'counter', true);
    Logger.info('Got : %j', v);
  });

  xit('should do a full query', async () => {
    const dr: DynamoRatchet = new DynamoRatchet(mockDynamo);

    Logger.setLevel(LoggerLevelName.debug);

    const input: DocQueryCommandInput = {
      TableName: 'some-table',
      KeyConditionExpression: 'groupId = :g',
      ExpressionAttributeValues: {
        ':g': 'NeonBatch',
      },
    };

    const res: any[] = await dr.fullyExecuteQuery<any>(input);
    Logger.info('Got : %j', res);
  });

  xit('should do a process over full query', async () => {
    const dr: DynamoRatchet = new DynamoRatchet(mockDynamo);

    Logger.setLevel(LoggerLevelName.debug);

    const input: DocQueryCommandInput = {
      TableName: 'some-table',
      KeyConditionExpression: 'groupId = :g',
      ExpressionAttributeValues: {
        ':g': 'NeonBatch',
      },
    };

    const res: number = await dr.fullyExecuteProcessOverQuery(input, async (v) => {
      Logger.info('Proc %j', v);
    });
    Logger.info('Got : %j', res);
  });
});
