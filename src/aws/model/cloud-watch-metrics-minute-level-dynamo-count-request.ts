/*
    Service for interacting with cloudwatch
*/

import { KeyValue } from '../../common/key-value.js';
import { DynamoRatchet } from '../dynamo-ratchet.js';
import { QueryInput, ScanInput } from 'aws-sdk/clients/dynamodb';

export interface CloudWatchMetricsMinuteLevelDynamoCountRequest {
  dynamoRatchet: DynamoRatchet;
  query: QueryInput;
  scan: ScanInput;

  minuteUTC: string; // Format yyyy-MM-dd HH:mm
  namespace: string;
  metric: string;
  dims: KeyValue[];
}
