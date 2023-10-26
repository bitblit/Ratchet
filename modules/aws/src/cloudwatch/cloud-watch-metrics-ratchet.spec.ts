import { CloudWatchMetricsRatchet } from './cloud-watch-metrics-ratchet.js';
import { KeyValue } from '@bitblit/ratchet-common';

import { CloudWatchClient, PutMetricDataCommand, StandardUnit } from '@aws-sdk/client-cloudwatch';
import { mockClient } from 'aws-sdk-client-mock';

let mockCW;

describe('#cloudWatchMetricsRatchet', function () {
  mockCW = mockClient(CloudWatchClient);
  beforeEach(() => {
    mockCW.reset();
    mockCW.reset();
  });

  it('should log a cloudwatch metric', async () => {
    mockCW.on(PutMetricDataCommand).resolves({ ok: true } as never);

    const cw: CloudWatchMetricsRatchet = new CloudWatchMetricsRatchet(mockCW);
    const dims: KeyValue<any>[] = [
      { key: 'server', value: 'prod' } as KeyValue<any>,
      { key: 'stage', value: 'v0' },
      { key: 'version', value: '20190529-01' },
    ];
    const res: any = await cw.writeSingleMetric('Ratchet/TestMetric01', 'MyMetric01', dims, StandardUnit.Count, 2, new Date(), false);

    expect(res).toBeTruthy();
  });
});
