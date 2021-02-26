import AWS from 'aws-sdk';
import { AthenaRatchet } from './athena-ratchet';
import { Logger } from '../common/logger';

describe('#AthenaRatchet', function () {
  xit('should test a query', async () => {
    const athena: AWS.Athena = new AWS.Athena({ region: 'us-east-1' });
    const s3: AWS.S3 = new AWS.S3({ region: 'us-east-1' });

    const outputDir: string = 's3://your-bucket/your-prefix';
    const qry: string = 'select * from test limit 20000';

    const ratchet: AthenaRatchet = new AthenaRatchet(athena, s3, outputDir);

    // const result: any[] = await ratchet.runQueryToObjects(qry);
    const result: string = await ratchet.runQueryToFile(qry, null, 'testfile.csv');

    expect(result).toBeTruthy();
    Logger.info('Got objects : %j', result);
  });
});
