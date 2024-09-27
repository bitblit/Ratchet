import { ExpiringCodeProvider } from '../../expiring-code/expiring-code-provider.js';
import { DynamoRatchet } from '../dynamo-ratchet.js';
import { ExpiringCode } from '../../expiring-code/expiring-code.js';
import { DynamoTableRatchet } from '../dynamo-table-ratchet.js';
import { PutCommandOutput } from '@aws-sdk/lib-dynamodb';

export class DynamoExpiringCodeProvider implements ExpiringCodeProvider {
  constructor(
    private tableName: string,
    private dynamoRatchet: DynamoRatchet,
  ) {}

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
    const output: PutCommandOutput = await this.dynamoRatchet.simplePut(this.tableName, code);
    return output && output.ConsumedCapacity.CapacityUnits > 0;
  }

  public async createTableIfMissing(dtr: DynamoTableRatchet): Promise<any> {
    return null; // TODO: Impl
  }
}
