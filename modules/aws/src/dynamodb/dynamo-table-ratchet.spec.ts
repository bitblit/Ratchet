import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { DescribeTableCommandOutput, DynamoDBClient } from '@aws-sdk/client-dynamodb';

import { mockClient } from 'aws-sdk-client-mock';
import { DynamoTableRatchet } from './dynamo-table-ratchet.js';
import { expect, test, describe, vi, beforeEach } from 'vitest';

let mockDynamo;

describe('#dynamoTableRatchet', function () {
  mockDynamo = mockClient(DynamoDBClient);

  beforeEach(() => {
    mockDynamo.reset();
  });

  test.skip('should copy a table', async () => {
    const dr: DynamoTableRatchet = new DynamoTableRatchet(mockDynamo);
    //const tn: string[] = await dr.listAllTables();
    const result: DescribeTableCommandOutput = await dr.copyTable('src-dev', 'dst-dev');
    Logger.info('result was : %j', result);
  }, 300_000_000);
});
