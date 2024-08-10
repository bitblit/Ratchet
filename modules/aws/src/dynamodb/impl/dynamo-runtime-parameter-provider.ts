import { PutCommandOutput, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { RuntimeParameterProvider } from "../../runtime-parameter/runtime-parameter-provider.js";
import { StoredRuntimeParameter } from "../../runtime-parameter/stored-runtime-parameter.js";
import { DynamoRatchet } from "../dynamo-ratchet.js";
import { RequireRatchet } from "@bitblit/ratchet-common/lang/require-ratchet";
import { Logger } from "@bitblit/ratchet-common/logger/logger";

export class DynamoRuntimeParameterProvider implements RuntimeParameterProvider {
  constructor(
    private dynamo: DynamoRatchet,
    private tableName: string,
  ) {
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
    const qry: QueryCommandInput = {
      TableName: this.tableName,
      KeyConditionExpression: 'groupId = :groupId',
      ExpressionAttributeValues: {
        ':groupId': groupId,
      },
    };

    const all: StoredRuntimeParameter[] = await this.dynamo.fullyExecuteQuery<StoredRuntimeParameter>(qry);
    return all;
  }

   
  public async writeParameter(toStore: StoredRuntimeParameter): Promise<boolean> {
    const rval: PutCommandOutput = await this.dynamo.simplePut(this.tableName, toStore);
    return !!rval;
  }
}
