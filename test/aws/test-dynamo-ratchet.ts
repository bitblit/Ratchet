import { expect } from 'chai';
import * as AWS from 'aws-sdk';
import { DynamoRatchet } from '../../src/aws/dynamo-ratchet';
import { Logger } from '../../src/common/logger';
import { ExpressionAttributeValueMap, QueryInput } from 'aws-sdk/clients/dynamodb';
import * as util from 'util';

describe('#atomicCounter', function() {
  this.timeout(300000);

  xit('should increment the counter and return the new value', async () => {
    const dr: DynamoRatchet = new DynamoRatchet(new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' }));
    const tableName: string = 'xxx';
    const res: number = await dr.atomicCounter(tableName, { groupId: 'global', unitId: 'sequence' }, 'lastValue', 1);
    Logger.info('Got : %s', res);
    expect(res).to.not.be.null;
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
        ':hashVal': curHash
      } as ExpressionAttributeValueMap
    };

    const res: any[] = await dr.fullyExecuteQuery<any>(qry, null, 150);

    Logger.info('Got : %s', res);
    expect(res).to.not.be.null;
  });
});
