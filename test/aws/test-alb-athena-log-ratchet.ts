import { expect } from 'chai';
import * as AWS from 'aws-sdk';
import { AthenaRatchet } from '../../src/aws/athena-ratchet';
import { Logger } from '../../src/common/logger';
import { AlbAthenaLogRatchet, AlbLogRecord, AlbLogRecordQuery } from '../../src/aws/alb-athena-log-ratchet';
import { TimeZoneRatchet } from '../../src/common/time-zone-ratchet';

describe('#AlbAthenaLogRatchet', function () {
  this.timeout(3000000);

  xit('should test a query', async () => {
    Logger.setLevelByName('debug');
    const athena: AWS.Athena = new AWS.Athena({ region: 'us-east-1' });
    const s3: AWS.S3 = new AWS.S3({ region: 'us-east-1' });

    const outputDir: string = 's3://alb-log-bucket/temp';
    const athRatchet: AthenaRatchet = new AthenaRatchet(athena, s3, outputDir);
    const srv: AlbAthenaLogRatchet = new AlbAthenaLogRatchet(athRatchet, 'alb_logs.log_table');

    const qry: AlbLogRecordQuery = {
      startTimeEpochMS: TimeZoneRatchet.PACIFIC.startOfTodayEpochMS(),
      endTimeEpochMS: TimeZoneRatchet.PACIFIC.startOfTodayEpochMS() + 1000 * 60 * 10,
      limit: 10,
    };

    const result: AlbLogRecord[] = await srv.fetchAlbLogRecords(qry);

    expect(result).to.not.be.null;
    Logger.info('Got objects : %j', result);
  });
});
