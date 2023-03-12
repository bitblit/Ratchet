import { AthenaRatchet } from './athena-ratchet';
import { Logger } from '@bitblit/ratchet-common';
import { AlbAthenaLogRatchet, AlbLogRecord, AlbLogRecordQuery } from './alb-athena-log-ratchet';
import { TimeZoneRatchet } from '../../common/time-zone-ratchet';
import { LoggerLevelName } from '@bitblit/ratchet-common';
import { S3Client } from '@aws-sdk/client-s3';
import { AthenaClient } from '@aws-sdk/client-athena';

describe('#AlbAthenaLogRatchet', function () {
  xit('should test a query', async () => {
    Logger.setLevel(LoggerLevelName.debug);
    const athena: AthenaClient = new AthenaClient({ region: 'us-east-1' });
    const s3: S3Client = new S3Client({ region: 'us-east-1' });

    const outputDir: string = 's3://alb-log-bucket/temp';
    const athRatchet: AthenaRatchet = new AthenaRatchet(athena, s3, outputDir);
    const srv: AlbAthenaLogRatchet = new AlbAthenaLogRatchet(athRatchet, 'alb_logs.log_table');

    const qry: AlbLogRecordQuery = {
      startTimeEpochMS: TimeZoneRatchet.PACIFIC.startOfTodayEpochMS(),
      endTimeEpochMS: TimeZoneRatchet.PACIFIC.startOfTodayEpochMS() + 1000 * 60 * 10,
      limit: 10,
    };

    const result: AlbLogRecord[] = await srv.fetchAlbLogRecords(qry);

    expect(result).toBeTruthy();
    Logger.info('Got objects : %j', result);
  });
});