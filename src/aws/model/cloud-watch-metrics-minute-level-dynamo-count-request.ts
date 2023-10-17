/*
    Service for interacting with cloudwatch
*/

import { KeyValue } from '../../common/key-value';
import { DynamoRatchet } from '../dynamodb/dynamo-ratchet';
import { QueryCommandInput, ScanCommandInput } from '@aws-sdk/lib-dynamodb';

export interface CloudWatchMetricsMinuteLevelDynamoCountRequest {
  dynamoRatchet: DynamoRatchet;
  query: QueryCommandInput;
  scan: ScanCommandInput;

  minuteUTC: string; // Format yyyy-MM-dd HH:mm
  namespace: string;
  metric: string;
  dims: KeyValue[];
}
