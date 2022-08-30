/*
    Service for interacting with cloudwatch
*/

import AWS, { AWSError } from 'aws-sdk';
import { Logger } from '../common/logger.js';
import { KeyValue } from '../common/key-value.js';
import { CloudWatchMetricsUnit } from './model/cloud-watch-metrics-unit.js';
import { PutMetricDataInput } from 'aws-sdk/clients/cloudwatch';
import { PromiseResult } from 'aws-sdk/lib/request';
import { DynamoCountResult } from './model/dynamo-count-result.js';
import { CloudWatchMetricsMinuteLevelDynamoCountRequest } from './model/cloud-watch-metrics-minute-level-dynamo-count-request.js';
import { DateTime } from 'luxon';

export class CloudWatchMetricsRatchet {
  private cw: AWS.CloudWatch;

  constructor(cloudWatch: AWS.CloudWatch = null) {
    this.cw = cloudWatch ? cloudWatch : new AWS.CloudWatch({ region: 'us-east-1', apiVersion: '2010-08-01' });
  }

  public async writeSingleMetric(
    namespace: string,
    metric: string,
    dims: KeyValue[],
    unit: CloudWatchMetricsUnit = CloudWatchMetricsUnit.None,
    value: number,
    timestampDate: Date = new Date(),
    highResolution = false
  ): Promise<any> {
    const cwDims: any[] = [];
    if (!!dims && dims.length > 0) {
      dims.forEach((d) => {
        cwDims.push({ Name: d.key, Value: d.value });
      });
    }
    const storageResolution: number = highResolution ? 1 : 60;

    const metricData: PutMetricDataInput = {
      Namespace: namespace,
      MetricData: [
        {
          MetricName: metric,
          Dimensions: cwDims,
          Unit: String(unit),
          Value: value,
          Timestamp: timestampDate,
          StorageResolution: storageResolution,
        },
      ],
    };
    Logger.silly('Writing metric to cw : %j', metricData);

    const result: PromiseResult<any, AWSError> = await this.cw.putMetricData(metricData).promise();
    Logger.silly('Result: %j', result);
    return result;
  }

  public async writeDynamoCountAsMinuteLevelMetric(req: CloudWatchMetricsMinuteLevelDynamoCountRequest): Promise<number> {
    Logger.info('Publishing %s / %s metric for %s UTC', req.namespace, req.metric, req.minuteUTC);

    if (!!req.scan && !!req.query) {
      throw new Error('Must send query or scan, but not both');
    }
    if (!req.scan && !req.query) {
      throw new Error('You must specify either a scan or a query');
    }

    const cnt: DynamoCountResult = !!req.query
      ? await req.dynamoRatchet.fullyExecuteQueryCount(req.query)
      : await req.dynamoRatchet.fullyExecuteScanCount(req.scan);

    Logger.debug('%s / %s for %s are %j', req.namespace, req.metric, req.minuteUTC, cnt);

    const parseDateString: string = req.minuteUTC.split(' ').join('T') + ':00Z';
    const parseDate: Date = DateTime.fromISO(parseDateString).toJSDate();

    const metricRes: any = await this.writeSingleMetric(
      req.namespace,
      req.metric,
      req.dims,
      CloudWatchMetricsUnit.Count,
      cnt.count,
      parseDate,
      false
    );
    Logger.debug('Metrics response: %j', metricRes);

    return cnt.count;
  }
}
