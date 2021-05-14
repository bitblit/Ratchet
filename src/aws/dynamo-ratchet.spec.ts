import AWS from 'aws-sdk';
import { DynamoRatchet } from './dynamo-ratchet';
import { Logger } from '../common/logger';
import { ExpressionAttributeValueMap, PutItemOutput, QueryInput } from 'aws-sdk/clients/dynamodb';

describe('#atomicCounter', function () {
  xit('should fetch items from a key-only index query', async () => {
    const dr: DynamoRatchet = new DynamoRatchet(new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' }));
    const tableName: string = 'some-table';
    const limit: number = 200;

    const qry: QueryInput = {
      TableName: tableName,
      IndexName: 'purchaseId-notBeforeEpochMS-index',
      KeyConditionExpression: 'purchaseId = :purchaseId',
      Limit: limit,
      ExpressionAttributeValues: {
        ':purchaseId': 'some-purchase',
      } as ExpressionAttributeValueMap,
    };

    const res: any[] = await dr.fetchFullObjectsMatchingKeysOnlyIndexQuery(qry, ['key1', 'key2']);

    Logger.info('Got : %s', res);
    expect(res).toBeTruthy();
  });

  xit('should increment the counter and return the new value', async () => {
    const dr: DynamoRatchet = new DynamoRatchet(new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' }));
    const tableName: string = 'xxx';
    const res: number = await dr.atomicCounter(tableName, { groupId: 'global', unitId: 'sequence' }, 'lastValue', 1);
    Logger.info('Got : %s', res);
    expect(res).toBeTruthy();
  });

  xit('should stop after the soft limit', async () => {
    const dr: DynamoRatchet = new DynamoRatchet(new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' }));

    const now: number = new Date().getTime();
    const nowSec: number = Math.floor(now / 1000);
    const curHash: string = 'someHash';

    const qry: QueryInput = {
      TableName: 'some-table',
      KeyConditionExpression: 'hashVal = :hashVal',
      ExpressionAttributeValues: {
        ':hashVal': curHash,
      } as ExpressionAttributeValueMap,
    };

    const res: any[] = await dr.fullyExecuteQuery<any>(qry, null, 150);

    Logger.info('Got : %s', res);
    expect(res).toBeTruthy();
  });

  xit('should run an insert / read test for slowdown', async () => {
    const dr: DynamoRatchet = new DynamoRatchet(new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' }));

    Logger.setLevelByName('debug');
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
    const dr: DynamoRatchet = new DynamoRatchet(new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' }));

    Logger.setLevelByName('debug');

    const val: any = {
      k1: 'abc',
      k2: 1,
    };

    for (let i = 0; i < 5; i++) {
      const rval: PutItemOutput = await dr.simplePutWithCollisionAvoidance(
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
    const dr: DynamoRatchet = new DynamoRatchet(new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' }));

    Logger.setLevelByName('debug');

    const v: any = await dr.simpleGetWithCounterDecrement<any>('cwtest', { k1: 'abc', k2: 11 }, 'counter', true);
    Logger.info('Got : %j', v);
  });
});
