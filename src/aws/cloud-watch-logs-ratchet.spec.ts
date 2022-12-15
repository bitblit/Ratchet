import { Logger } from '../common/logger';
import { CloudWatchLogsRatchet } from './cloud-watch-logs-ratchet';
import {
  DescribeLogGroupsResponse,
  GetQueryResultsResponse,
  LogGroup,
  StartQueryRequest,
  StartQueryResponse,
} from 'aws-sdk/clients/cloudwatchlogs';
import AWS from 'aws-sdk';
import { JestRatchet } from '../jest';

let mockCW: jest.Mocked<AWS.CloudWatchLogs>;

describe('#cloudWatchLogsRatchet', function () {
  beforeEach(() => {
    mockCW = JestRatchet.mock();
  });

  it('should find all matching groups', async () => {
    mockCW.describeLogGroups.mockReturnValue({
      promise: async () => Promise.resolve({ logGroups: [{ logGroupName: '1' }, { logGroupName: '2' }] } as DescribeLogGroupsResponse),
    } as never);

    const cw: CloudWatchLogsRatchet = new CloudWatchLogsRatchet(mockCW);
    const prefix: string = '/';

    const res: LogGroup[] = await cw.findLogGroups(prefix);
    expect(res).toBeTruthy();
    expect(res.length).toEqual(2);
  });

  it('should execute an insights query', async () => {
    mockCW.startQuery.mockReturnValue({
      promise: async () => Promise.resolve({ queryId: 'test' } as StartQueryResponse),
    } as never);

    mockCW.getQueryResults.mockReturnValue({
      promise: async () => Promise.resolve({} as GetQueryResultsResponse),
    } as never);

    const cw: CloudWatchLogsRatchet = new CloudWatchLogsRatchet(mockCW);

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

    expect(res).toBeTruthy();

    Logger.info('Got : %j', res);
  });
});
