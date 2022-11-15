import { ExpiringCodeProvider } from './expiring-code-provider';
import { DynamoRatchet } from '../dynamo-ratchet';
import { ExpiringCode } from './expiring-code';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import PutItemOutput = DocumentClient.PutItemOutput;
import { DynamoTableRatchet } from '../dynamo-table-ratchet';
import { S3CacheRatchet } from '../s3-cache-ratchet';
import { RequireRatchet } from '../../common';

/* An implementation that puts all the values in a single JSON file in S3
  This won't scale well at all for any kind of serious load, but is the easiest
  solution for a very low traffic website since it doesn't require setting up tables,
  provisioning, etc
 */
export class S3ExpiringCodeProvider implements ExpiringCodeProvider {
  constructor(private s3CacheRatchet: S3CacheRatchet, private keyName: string) {
    RequireRatchet.notNullOrUndefined(s3CacheRatchet, 's3CacheRatchet');
    RequireRatchet.notNullOrUndefined(s3CacheRatchet.getDefaultBucket(), 's3CacheRatchet.defaultBucket');
    RequireRatchet.notNullOrUndefined(keyName, 'keyName');
  }

  public async checkCode(code: string, context: string, deleteOnMatch?: boolean): Promise<boolean> {
    const keys: any = { code: code, context: context };
    const expCode: ExpiringCode = await this.dynamoRatchet.simpleGet<ExpiringCode>(this.tableName, keys);
    const rval: boolean = expCode && expCode.expiresEpochMS > Date.now();
    if (rval && deleteOnMatch) {
      await this.dynamoRatchet.simpleDelete(this.tableName, keys);
    }
    return rval;
  }

  public async storeCode(code: ExpiringCode): Promise<boolean> {
    const output: PutItemOutput = await this.dynamoRatchet.simplePut(this.tableName, code);
    return output && output.ConsumedCapacity.CapacityUnits > 0;
  }

  public async createTableIfMissing(dtr: DynamoTableRatchet): Promise<any> {
    return null; // TODO: Impl
  }
}
