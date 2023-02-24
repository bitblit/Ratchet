/*
Strong typing for results from dynamo db count queries
 */
import { UpdateItemCommandInput } from '@aws-sdk/client-dynamodb';

export interface DocUpdateItemCommandInput extends UpdateItemCommandInput {
  ExpressionAttributeValues?: Record<string, any>;
  ExpressionAttributeNames?: Record<string, any>;
}
