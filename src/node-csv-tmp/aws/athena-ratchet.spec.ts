import AWS, { AWSError } from 'aws-sdk';
import { AthenaRatchet } from './athena-ratchet';
import { Logger } from '../../common/logger';
import { JestRatchet } from '../../jest';
import { PromiseResult } from 'aws-sdk/lib/request';
import { GetQueryExecutionOutput, StartQueryExecutionOutput } from 'aws-sdk/clients/athena';
import { SubmitJobResponse } from 'aws-sdk/clients/batch';

let mockAthena: jest.Mocked<AWS.Athena>;
let mockS3: jest.Mocked<AWS.S3>;

describe('#AthenaRatchet', function () {
  beforeEach(() => {
    mockAthena = JestRatchet.mock();
    mockS3 = JestRatchet.mock();
  });

  it('should test a query', async () => {
    const outputDir: string = 's3://your-bucket/your-prefix';
    const qry: string = 'select * from test limit 20000';

    mockAthena.startQueryExecution.mockReturnValue({
      promise: async () => Promise.resolve({ jobName: 'b' } as StartQueryExecutionOutput),
    } as never);
    mockAthena.getQueryExecution.mockReturnValue({
      promise: async () =>
        Promise.resolve({
          QueryExecution: { ResultConfiguration: { OutputLocation: 'test' }, Status: { State: 'SUCCEEDED' } },
        } as GetQueryExecutionOutput),
    } as never);

    const ratchet: AthenaRatchet = new AthenaRatchet(mockAthena, mockS3, outputDir);

    const result: any[] = await ratchet.runQueryToObjects(qry);
    //const result: string = await ratchet.runQueryToFile(qry, null, 'testfile.csv');

    expect(result).toBeTruthy();
    Logger.info('Got objects : %j', result);
  });
});
