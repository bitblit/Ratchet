import { Logger } from '@bitblit/ratchet-common/logger/logger.js';
import { CloudWatchLogsRatchet } from './cloud-watch-logs-ratchet.js';
import {
  CloudWatchLogsClient,
  DeleteLogGroupCommand,
  DeleteLogStreamCommand,
  DescribeLogGroupsCommand,
  DescribeLogStreamsCommand,
  GetQueryResultsCommand,
  GetQueryResultsCommandOutput,
  LogGroup,
  LogStream,
  StartQueryCommand,
  StartQueryCommandInput,
} from '@aws-sdk/client-cloudwatch-logs';
import { mockClient } from 'aws-sdk-client-mock';

let mockCW;

describe('#cloudWatchLogsRatchet', function () {
  mockCW = mockClient(CloudWatchLogsClient);

  beforeEach(() => {
    mockCW.reset();
  });

  it('should find the stream with the oldest timestamp in a group', async () => {
    mockCW.on(DescribeLogStreamsCommand).resolves({
      logStreams: [
        { logStreamName: '1', firstEventTimestamp: 100 },
        { logStreamName: '2', firstEventTimestamp: 200 },
      ],
    } as never);

    const cw: CloudWatchLogsRatchet = new CloudWatchLogsRatchet(mockCW);
    const res: LogStream = await cw.findStreamWithOldestEventInGroup('test');
    expect(res).toBeTruthy();
    expect(res.logStreamName).toEqual('1');
  });

  it('should find the oldest timestamp in group', async () => {
    mockCW.on(DescribeLogStreamsCommand).resolves({
      logStreams: [
        { logStreamName: '1', firstEventTimestamp: 100 },
        { logStreamName: '2', firstEventTimestamp: 200 },
      ],
    } as never);

    const cw: CloudWatchLogsRatchet = new CloudWatchLogsRatchet(mockCW);
    const res: number = await cw.findOldestEventTimestampInGroup('test');
    expect(res).toEqual(100);
  });

  it('should remove log groups', async () => {
    mockCW.on(DeleteLogGroupCommand).resolves(null);

    const cw: CloudWatchLogsRatchet = new CloudWatchLogsRatchet(mockCW);
    const res: boolean[] = await cw.removeLogGroups([{ logGroupName: '1' }, { logGroupName: '2' }]);
    expect(res.length).toEqual(2);
  });

  it('should remove log groups with prefix', async () => {
    mockCW.on(DescribeLogGroupsCommand).resolves({
      logGroups: [{ logGroupName: 'pre1' }, { logGroupName: 'pre2' }],
    } as never);

    mockCW.on(DeleteLogGroupCommand).resolves(null);

    const cw: CloudWatchLogsRatchet = new CloudWatchLogsRatchet(mockCW);
    const res: boolean[] = await cw.removeLogGroupsWithPrefix('pre');
    expect(res.length).toEqual(2);
  });

  it('should remove empty or old log streams', async () => {
    mockCW.on(DescribeLogStreamsCommand).resolves({
      logStreams: [{ logStreamName: '1' }, { logStreamName: '2' }],
    } as never);

    mockCW.on(DeleteLogStreamCommand).resolves(null);

    const cw: CloudWatchLogsRatchet = new CloudWatchLogsRatchet(mockCW);
    const res: LogStream[] = await cw.removeEmptyOrOldLogStreams('test', 1000);
    expect(res).toBeTruthy();
    expect(res.length).toEqual(2);
  });

  it('should find all matching groups', async () => {
    mockCW.on(DescribeLogGroupsCommand).resolves({ logGroups: [{ logGroupName: '1' }, { logGroupName: '2' }] } as never);

    const cw: CloudWatchLogsRatchet = new CloudWatchLogsRatchet(mockCW);
    const prefix: string = '/';

    const res: LogGroup[] = await cw.findLogGroups(prefix);
    expect(res).toBeTruthy();
    expect(res.length).toEqual(2);
  });

  it('should execute an insights query', async () => {
    mockCW.on(StartQueryCommand).resolves({ queryId: 'test' });

    mockCW.on(GetQueryResultsCommand).resolves({});

    const cw: CloudWatchLogsRatchet = new CloudWatchLogsRatchet(mockCW);

    const logGroups: string[] = ['/someGroup'];

    const now: number = Math.floor(new Date().getTime() / 1000);

    const req: StartQueryCommandInput = {
      endTime: now,
      limit: 200,
      logGroupNames: logGroups,
      queryString: 'fields @timestamp, @message | sort @timestamp desc',
      startTime: now - 60 * 60 * 24, // 1 day ago
    };
    const res: GetQueryResultsCommandOutput = await cw.fullyExecuteInsightsQuery(req);

    expect(res).toBeTruthy();

    Logger.info('Got : %j', res);
  });
});
