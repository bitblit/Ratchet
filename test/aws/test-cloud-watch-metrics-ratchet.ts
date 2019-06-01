import {expect} from 'chai';
import {CloudWatchMetricsRatchet} from '../../src/aws/cloud-watch-metrics-ratchet';
import {KeyValue} from '../../src/common/key-value';
import {CloudWatchMetricsUnit} from '../../src/aws/cloud-watch-metrics-unit';
import {Logger} from '../../src/common/logger';

describe('#cloudWatchMetricsRatchet', function() {
    it('should log a cloudwatch metric', async() => {
        const cw: CloudWatchMetricsRatchet = new CloudWatchMetricsRatchet();
        const dims: KeyValue[] =  [{key:'server',value:'prod'} as KeyValue, {key: 'stage', value: 'v0'},
            {key: 'version', value: '20190529-01'}];
        const res: any = await cw.writeSingleMetric(
            'Ratchet/TestMetric01',
            'MyMetric01',
            dims,
            CloudWatchMetricsUnit.Count,
            2,
            new Date(),
            false
        );

        Logger.info('Got : %j',res);
    });

});