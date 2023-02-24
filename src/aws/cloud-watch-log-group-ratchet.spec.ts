import { CloudWatchLogs, DescribeLogStreamsCommandOutput } from '@aws-sdk/client-cloudwatch-logs';
import { JestRatchet } from '../jest';
import { CloudWatchLogGroupRatchet } from './cloud-watch-log-group-ratchet';

let mockCW: jest.Mocked<CloudWatchLogs>;

describe('#CloudWatchLogGroupRatchet', function () {
  beforeEach(() => {
    mockCW = JestRatchet.mock();
  });

  it('should read log stream names', async () => {
    mockCW.describeLogStreams.mockReturnValue({
      promise: async () =>
        Promise.resolve({
          logStreams: [{ logStreamName: '1' }, { logStreamName: '2' }],
        } as DescribeLogStreamsCommandOutput),
    } as never);

    const cw: CloudWatchLogGroupRatchet = new CloudWatchLogGroupRatchet('testGroup', mockCW);

    const res: string[] = await cw.readLogStreamNames();

    expect(res).toBeTruthy();
    expect(res.length).toEqual(2);
  });
});
