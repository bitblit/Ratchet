import { AthenaRatchet } from './athena-ratchet.js';
import { Logger } from '@bitblit/ratchet-common/logger/logger';
import {
  AthenaClient,
  GetQueryExecutionCommand,
  GetQueryExecutionOutput,
  StartQueryExecutionCommand,
  StartQueryExecutionOutput,
} from '@aws-sdk/client-athena';
import { S3Client } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import { beforeEach, describe, expect, test } from 'vitest';

let mockAthena;
let mockS3;

describe('#AthenaRatchet', function () {
  mockAthena = mockClient(AthenaClient);
  mockS3 = mockClient(S3Client);

  beforeEach(() => {
    mockAthena.reset();
    mockS3.reset();
  });

  test.skip('should test a query', async () => {
    const outputDir: string = 's3://your-bucket/your-prefix';
    const qry: string = 'select * from test limit 20000';

    mockAthena.on(StartQueryExecutionCommand).resolves({ jobName: 'b' } as StartQueryExecutionOutput);
    mockAthena.on(GetQueryExecutionCommand).resolves({
      QueryExecution: { ResultConfiguration: { OutputLocation: 'test' }, Status: { State: 'SUCCEEDED' } },
    } as GetQueryExecutionOutput);

    const ratchet: AthenaRatchet = new AthenaRatchet(mockAthena, mockS3, outputDir);

    const result: any[] = await ratchet.runQueryToObjects(qry);
    //const result: string = await ratchet.runQueryToFile(qry, null, 'testfile.csv');

    expect(result).toBeTruthy();
    Logger.info('Got objects : %j', result);
  });
});
