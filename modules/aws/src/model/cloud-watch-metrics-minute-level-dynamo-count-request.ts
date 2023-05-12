/*
    Service for interacting with cloudwatch
*/

import { KeyValue } from '@bitblit/ratchet-common';
import { DynamoRatchet } from '../dynamodb/dynamo-ratchet.js';
import { QueryInput, ScanCommandInput } from '@aws-sdk/client-dynamodb';

export interface CloudWatchMetricsMinuteLevelDynamoCountRequest {
  dynamoRatchet: DynamoRatchet;
  query: QueryInput;
  scan: ScanCommandInput;

  minuteUTC: string; // Format yyyy-MM-dd HH:mm
  namespace: string;
  metric: string;
  dims: KeyValue[];
}
