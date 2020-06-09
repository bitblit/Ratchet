import { expect } from 'chai';
import { Logger } from '../../src/common/logger';
import { CloudWatchLogsRatchet } from '../../src/aws/cloud-watch-logs-ratchet';
import { GetQueryResultsResponse, LogGroup, StartQueryRequest } from 'aws-sdk/clients/cloudwatchlogs';

describe('#cloudWatchLogsRatchet', function () {
  this.timeout(3000000);
  xit('should find all matching groups', async () => {
    const cw: CloudWatchLogsRatchet = new CloudWatchLogsRatchet();
    const prefix: string = '/';

    const res: LogGroup[] = await cw.findLogGroups(prefix);
    expect(res).to.not.be.null;

    Logger.info('Got : %j', res);
  });

  xit('should execute an insights query', async () => {
    const cw: CloudWatchLogsRatchet = new CloudWatchLogsRatchet();

    const logGroups: string[] = ['/someGroup'];

    const now: number = Math.floor(new Date().getTime() / 1000);

    const req: StartQueryRequest = {
      endTime: now,
      limit: 200,
      logGroupNames: logGroups,
      queryString: 'fields @timestamp, @message | sort @timestamp desc',
      startTime: now - 60 * 60 * 24, // 1 day ago
    };
    const res: GetQueryResultsResponse = await cw.fullyExecuteInsightsQuery(req);

    expect(res).to.not.be.null;

    Logger.info('Got : %j', res);
  });
});
