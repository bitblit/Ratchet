import {CloudWatchMetricsRatchet} from './cloud-watch-metrics-ratchet';
import {KeyValue} from '../common/key-value';
import {CloudWatchMetricsUnit} from './model/cloud-watch-metrics-unit';
import {Logger} from '../common/logger';

describe('#cloudWatchMetricsRatchet', function () {
  xit('should log a cloudwatch metric', async () => {
    const cw: CloudWatchMetricsRatchet = new CloudWatchMetricsRatchet();
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

    Logger.info('Got : %j', res);
  });
});
