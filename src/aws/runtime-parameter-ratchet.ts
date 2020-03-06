import {Logger} from '../common/logger';
import {DynamoRatchet} from './dynamo-ratchet';
import {RequireRatchet} from '../common/require-ratchet';
import {
    ExpressionAttributeValueMap,
    QueryInput
} from 'aws-sdk/clients/dynamodb';

export class RuntimeParameterRatchet {
    private cache: Map<String, CachedStoredRuntimeParameter> = new Map<String, CachedStoredRuntimeParameter>();

    constructor(private dynamo: DynamoRatchet, private tableName: string) {
        RequireRatchet.notNullOrUndefined(this.dynamo);
        RequireRatchet.notNullOrUndefined(this.tableName);
    }

    public async fetchParameter<T>(groupId: string, paramKey: string, defaultValue: T = null, forceFreshRead: boolean = false): Promise<T> {
        Logger.debug('Reading parameter %s / %s / Force : %s', groupId, paramKey, forceFreshRead);
        const cached: CachedStoredRuntimeParameter = this.cache.get(this.toCacheStoreKey(groupId, paramKey));

        let rval: T = null;
        const now: number = new Date().getTime();
        if (!forceFreshRead && !!cached) {
            const oldest: number = (!!cached.ttlSeconds) ? now - (cached.ttlSeconds * 1000) : 0;
            if (cached.storedEpochMS > oldest) {
                Logger.silly('Fetched %s / %s from cache', groupId, paramKey);
                rval = JSON.parse(cached.paramValue);
            }
        }
        if (!rval) {
            const temp: StoredRuntimeParameter = await this.readUnderlyingEntry(groupId, paramKey);
            if (!!temp) {
                this.addToCache(temp);
                rval = JSON.parse(temp.paramValue);
            }
        }

        rval = rval || defaultValue;

        return rval;
    }

    public async fetchAllParametersForGroup(groupId: string): Promise<Map<string, any>> {
        const all: StoredRuntimeParameter[] = await this.readUnderlyingEntries(groupId);
        const rval: Map<string, any> = new Map<string, any>();
        all.forEach(t => {
            rval.set(t.paramKey, JSON.parse(t.paramValue));
            this.addToCache(t);
        });
        return rval;
    }

    public async readUnderlyingEntry(groupId: string, paramKey: string): Promise<StoredRuntimeParameter> {
        Logger.silly('Reading %s / %s from underlying db', groupId, paramKey);
        const req: any = {
            groupId: groupId,
            paramKey: paramKey
        };
        const rval: StoredRuntimeParameter = await this.dynamo.simpleGet<StoredRuntimeParameter>(this.tableName, req);
        return rval;
    }

    public async readUnderlyingEntries(groupId: string): Promise<StoredRuntimeParameter[]> {
        const qry: QueryInput = {
            TableName: this.tableName,
            KeyConditionExpression: 'groupId = :groupId',
            ExpressionAttributeValues: {
                ':groupId' : groupId
            } as ExpressionAttributeValueMap
        };

        const all: StoredRuntimeParameter[] = await this.dynamo.fullyExecuteQuery<StoredRuntimeParameter>(qry);
        return all;
    }

    public async storeParameter(groupId: string, paramKey: string, paramValue: any, ttlSeconds: number): Promise<StoredRuntimeParameter> {
        const toStore: StoredRuntimeParameter = {
            groupId: groupId,
            paramKey: paramKey,
            paramValue: JSON.stringify(paramValue),
            ttlSeconds: ttlSeconds
        };
        await this.dynamo.simplePut(this.tableName, toStore);
        return this.readUnderlyingEntry(groupId, paramKey);
    }

    private toCacheStoreKey(groupId: string, paramKey: string): string {
        return groupId + ':::' + paramKey;
    }

    private addToCache(temp: StoredRuntimeParameter): void {
        if (!!temp) {
            const now: number = new Date().getTime();
            const toStore: CachedStoredRuntimeParameter = Object.assign({storedEpochMS: now}, temp);
            this.cache.set(this.toCacheStoreKey(temp.groupId, temp.paramKey), toStore);
        }
    }

    public clearCache(): void {
        Logger.debug('Clearing runtime parameter cache');
        this.cache = new Map<String, CachedStoredRuntimeParameter>();
    }

}

export interface StoredRuntimeParameter {
    groupId: string;
    paramKey: string;
    paramValue: string;
    ttlSeconds: number;
}

export interface CachedStoredRuntimeParameter extends StoredRuntimeParameter {
    storedEpochMS: number;
}
