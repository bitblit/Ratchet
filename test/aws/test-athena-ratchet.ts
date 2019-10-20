import { expect } from 'chai';
import * as AWS from 'aws-sdk';
import {AthenaRatchet} from '../../src/aws/athena-ratchet';
import {Logger} from '../../src/common/logger';

describe('#AthenaRatchet', function() {
    this.timeout(30000);
    xit('should test a query', async() => {
        let athena: AWS.Athena = new AWS.Athena({region: 'us-east-1'});
        let s3: AWS.S3 = new AWS.S3({region: 'us-east-1'});

        const outputDir: string = 's3://your-bucket/your-prefix';
        const qry: string = 'select * from test limit 20000';

        const ratchet: AthenaRatchet = new AthenaRatchet(athena,s3,outputDir);

        // const result: any[] = await ratchet.runQueryToObjects(qry);
        const result: string = await ratchet.runQueryToFile(qry, null, 'testfile.csv');

        expect(result).to.not.be.null;
        Logger.info('Got objects : %j', result);
    });

});
