import {CloudWatchMetricsRatchet} from './cloud-watch-metrics-ratchet';
import {KeyValue} from '../../common/key-value';

import {CloudWatchMetricsUnit} from '../model/cloud-watch-metrics-unit';
import {CloudWatchClient, PutMetricDataCommand} from '@aws-sdk/client-cloudwatch';
import {mockClient} from 'aws-sdk-client-mock';

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
    const dims: KeyValue[] = [
      { key: 'server', value: 'prod' } as KeyValue,
      { key: 'stage', value: 'v0' },
      { key: 'version', value: '20190529-01' },
    ];
    const res: any = await cw.writeSingleMetric(
      'Ratchet/TestMetric01',
      'MyMetric01',
      dims,
      CloudWatchMetricsUnit.Count,
      2,
      new Date(),
      false
    );

    expect(res).toBeTruthy();
  });
});
