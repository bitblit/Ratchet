import { PutItemOutput } from '@aws-sdk/client-dynamodb';
import { RuntimeParameterProvider } from './runtime-parameter-provider.js';
import { StoredRuntimeParameter } from './stored-runtime-parameter.js';
import { DynamoRatchet } from '../dynamodb/dynamo-ratchet.js';
import { RequireRatchet } from '@bitblit/ratchet-common/lang/require-ratchet.js';
import { Logger } from '@bitblit/ratchet-common/logger/logger.js';
import { DocQueryCommandInput } from '../model/dynamo/doc-query-command-input.js';

export class DynamoRuntimeParameterProvider implements RuntimeParameterProvider {
  constructor(private dynamo: DynamoRatchet, private tableName: string) {
    RequireRatchet.notNullOrUndefined(this.dynamo);
    RequireRatchet.notNullOrUndefined(this.tableName);
  }

  public async readParameter(groupId: string, paramKey: string): Promise<StoredRuntimeParameter> {
    Logger.silly('Reading %s / %s from underlying db', groupId, paramKey);
    const req: any = {
      groupId: groupId,
      paramKey: paramKey,
    };
    const rval: StoredRuntimeParameter = await this.dynamo.simpleGet<StoredRuntimeParameter>(this.tableName, req);
    return rval;
  }

  public async readAllParametersForGroup(groupId: string): Promise<StoredRuntimeParameter[]> {
    const qry: DocQueryCommandInput = {
      TableName: this.tableName,
      KeyConditionExpression: 'groupId = :groupId',
      ExpressionAttributeValues: {
        ':groupId': groupId,
      },
    };

    const all: StoredRuntimeParameter[] = await this.dynamo.fullyExecuteQuery<StoredRuntimeParameter>(qry);
    return all;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public async writeParameter(toStore: StoredRuntimeParameter): Promise<boolean> {
    const rval: PutItemOutput = await this.dynamo.simplePut(this.tableName, toStore);
    return !!rval;
  }
}
