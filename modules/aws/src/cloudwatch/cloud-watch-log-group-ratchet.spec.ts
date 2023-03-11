import { CloudWatchLogsClient, DescribeLogStreamsCommand, DescribeLogStreamsCommandOutput } from '@aws-sdk/client-cloudwatch-logs';
import { CloudWatchLogGroupRatchet } from './cloud-watch-log-group-ratchet';
import { mockClient } from 'aws-sdk-client-mock';

let mockCW;

describe('#CloudWatchLogGroupRatchet', function () {
  mockCW = mockClient(CloudWatchLogsClient);
  beforeEach(() => {
    mockCW.reset();
  });

  it('should read log stream names', async () => {
    mockCW.on(DescribeLogStreamsCommand).resolves({
      logStreams: [{ logStreamName: '1' }, { logStreamName: '2' }],
    } as DescribeLogStreamsCommandOutput);

    const cw: CloudWatchLogGroupRatchet = new CloudWatchLogGroupRatchet('testGroup', mockCW);

    const res: string[] = await cw.readLogStreamNames();

    expect(res).toBeTruthy();
    expect(res.length).toEqual(2);
  });
});
