import { Logger } from '@bitblit/ratchet-common';
import { DescribeTableCommandOutput, DynamoDBClient } from '@aws-sdk/client-dynamodb';

import { mockClient } from 'aws-sdk-client-mock';
import { DynamoTableRatchet } from './dynamo-table-ratchet.js';

let mockDynamo;

describe('#dynamoTableRatchet', function () {
  mockDynamo = mockClient(DynamoDBClient);

  beforeEach(() => {
    mockDynamo.reset();
  });

  xit('should copy a table', async () => {
    const dr: DynamoTableRatchet = new DynamoTableRatchet(mockDynamo);
    //const tn: string[] = await dr.listAllTables();
    const result: DescribeTableCommandOutput = await dr.copyTable('src-dev', 'dst-dev');
    Logger.info('result was : %j', result);
  }, 300_000_000);
});
