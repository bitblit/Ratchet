/*
    Service for interacting with cloudwatch
*/

import * as AWS from 'aws-sdk';
import {Logger} from '../common/logger';
import {KeyValue} from '../common/key-value';
import {CloudWatchMetricsUnit} from './cloud-watch-metrics-unit';
import {PutMetricDataInput} from 'aws-sdk/clients/cloudwatch';
import {PromiseResult} from 'aws-sdk/lib/request';
import {AWSError} from 'aws-sdk';

export class CloudWatchMetricsRatchet {
    private cw: AWS.CloudWatch;

    constructor(cloudWatch: AWS.CloudWatch = null) {
        this.cw = (cloudWatch) ? cloudWatch : new AWS.CloudWatch({region: 'us-east-1', apiVersion: '2010-08-01'});
    }

    public async writeSingleMetric(namespace: string, metric: string, dims: KeyValue[],
                             unit: CloudWatchMetricsUnit = CloudWatchMetricsUnit.None,
                             value: number, timestampDate: Date = new Date(),
                                   highResolution: boolean = false): Promise<any> {
        const cwDims: any[] = [];
        if (!!dims && dims.length>0) {
            dims.forEach(d=>{
                cwDims.push({Name: d.key, Value: d.value});
            });
        }
        const storageResolution: number = (highResolution)?1:60;

        const metricData: PutMetricDataInput = {
            Namespace: namespace,
            MetricData: [
                {
                    MetricName: metric,
                    Dimensions: cwDims,
                    Unit: String(unit),
                    Value: value,
                    Timestamp: timestampDate,
                    StorageResolution: storageResolution
                }
            ]
        };
        Logger.silly('Writing metric to cw : %j', metricData);

        const result: PromiseResult<any, AWSError> = await this.cw.putMetricData(metricData).promise();
        Logger.silly('Result: %j', result);
        return result;
    }


}
