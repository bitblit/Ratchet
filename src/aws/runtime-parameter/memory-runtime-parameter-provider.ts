import { ExpressionAttributeValueMap, PutItemOutput, QueryInput } from 'aws-sdk/clients/dynamodb';
import { RuntimeParameterProvider } from './runtime-parameter-provider';
import { StoredRuntimeParameter } from './stored-runtime-parameter';
import { DynamoRatchet } from '../dynamo-ratchet';
import { RequireRatchet } from '../../common/require-ratchet';
import { Logger } from '../../common/logger';

/**
 * Very simple class, basically here just for unit testing although I suppose you could
 * use it for something else
 */
export class MemoryRuntimeParameterProvider implements RuntimeParameterProvider {
  constructor(private data: Promise<Record<string, StoredRuntimeParameter>> = Promise.resolve({})) {}

  public async readParameter(groupId: string, paramKey: string): Promise<StoredRuntimeParameter> {
    Logger.silly('Reading %s / %s from underlying db', groupId, paramKey);
    const d: Record<string, StoredRuntimeParameter> = await this.data;
    return d[groupId + '::' + paramKey];
  }

  public async readAllParametersForGroup(groupId: string): Promise<StoredRuntimeParameter[]> {
    const d: Record<string, StoredRuntimeParameter> = await this.data;
    const out: StoredRuntimeParameter[] = [];
    Object.keys(d).forEach((k) => {
      if (k.startsWith(groupId)) {
        out.push(d[k]);
      }
    });
    return out;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public async writeParameter(toStore: StoredRuntimeParameter): Promise<boolean> {
    const d: Record<string, StoredRuntimeParameter> = await this.data;
    d[toStore.groupId + '::' + toStore.paramKey] = toStore;
    return true;
  }
}
