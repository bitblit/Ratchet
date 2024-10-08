import { DynamoRuntimeParameterProvider } from './dynamo-runtime-parameter-provider.js';
import { DynamoRatchet } from '../dynamo-ratchet.js';
import { StoredRuntimeParameter } from '../../runtime-parameter/stored-runtime-parameter.js';

import { RuntimeParameterRatchet } from '../../runtime-parameter/runtime-parameter-ratchet.js';
import { PutCommandOutput } from '@aws-sdk/lib-dynamodb';
import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { PromiseRatchet } from '@bitblit/ratchet-common/lang/promise-ratchet';
import { LoggerLevelName } from '@bitblit/ratchet-common/logger/logger-level-name';
import { beforeEach, describe, expect, test } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';

let mockDynamoRatchet: MockProxy<DynamoRatchet>;
const testEntry: StoredRuntimeParameter = { groupId: 'test', paramKey: 'test', paramValue: '15', ttlSeconds: 0.5 };
const testEntry2: StoredRuntimeParameter = { groupId: 'test', paramKey: 'test1', paramValue: '20', ttlSeconds: 0.5 };

describe('#runtimeParameterRatchet', function () {
  beforeEach(() => {
    mockDynamoRatchet = mock<DynamoRatchet>();
  });

  test('fetch and cache a runtime parameter', async () => {
    Logger.setLevel(LoggerLevelName.silly);
    const tableName: string = 'default-table';
    mockDynamoRatchet.simpleGet.mockResolvedValue(testEntry);
    mockDynamoRatchet.simplePut.mockResolvedValue({} as PutCommandOutput);
    const drpp: DynamoRuntimeParameterProvider = new DynamoRuntimeParameterProvider(mockDynamoRatchet, tableName);
    const rpr: RuntimeParameterRatchet = new RuntimeParameterRatchet(drpp);

    const stored: StoredRuntimeParameter = await rpr.storeParameter('test', 'test1', 15, 0.5);
    Logger.info('Stored : %j', stored);

    const cache1: number = await rpr.fetchParameter<number>('test', 'test1');
    const cache1a: number = await rpr.fetchParameter<number>('test', 'test1');
    const cache1b: number = await rpr.fetchParameter<number>('test', 'test1');
    expect(cache1).toEqual(15);
    expect(cache1a).toEqual(15);
    expect(cache1b).toEqual(15);

    await PromiseRatchet.wait(1000);

    const cache2: number = await rpr.fetchParameter<number>('test', 'test1');
    expect(cache2).toEqual(15);

    mockDynamoRatchet.simpleGet.mockResolvedValue(null);
    const cacheMiss: number = await rpr.fetchParameter<number>('test', 'test-miss');
    expect(cacheMiss).toBeNull();

    const cacheDefault: number = await rpr.fetchParameter<number>('test', 'test-miss', 27);
    expect(cacheDefault).toEqual(27);
  }, 30_000);

  test('reads underlying entries', async () => {
    Logger.setLevel(LoggerLevelName.silly);
    const tableName: string = 'default-table';
    mockDynamoRatchet.fullyExecuteQuery.mockResolvedValue([testEntry, testEntry2]);
    const drpp: DynamoRuntimeParameterProvider = new DynamoRuntimeParameterProvider(mockDynamoRatchet, tableName);
    const rpr: RuntimeParameterRatchet = new RuntimeParameterRatchet(drpp);

    const vals: StoredRuntimeParameter[] = await rpr.readUnderlyingEntries('test');

    expect(vals).not.toBeFalsy();
    expect(vals.length).toEqual(2);
  }, 30_000);
});
