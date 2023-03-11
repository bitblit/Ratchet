/*
This is here because in order to use the DocumentClient in AWS lib V3, you must NOT convert the items
in the fields below to AttributeValue - but, the only way to do that is to use type ANY!  This interface
allows you to strongly type everything else while still using the document client.  Makes me wonder if
anyone at AMZN actually uses their own library...
 */
import { PutItemCommandInput } from '@aws-sdk/client-dynamodb';

export interface DocPutItemCommandInput extends PutItemCommandInput {
  Item: Record<string, any>;
}
