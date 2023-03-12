import { DynamoRuntimeParameterProvider } from './dynamo-runtime-parameter-provider';
import { DynamoRatchet } from '../dynamodb/dynamo-ratchet';
import { StoredRuntimeParameter } from './stored-runtime-parameter';
import { JestRatchet } from '@bitblit/ratchet-jest';
import { LoggerLevelName } from '@bitblit/ratchet-common';
import { Logger } from '@bitblit/ratchet-common';
import { RuntimeParameterRatchet } from './runtime-parameter-ratchet';
import { GlobalVariableOverrideRuntimeParameterProvider } from './global-variable-override-runtime-parameter-provider';

let mockDynamoRatchet: jest.Mocked<DynamoRatchet>;
const testEntry: StoredRuntimeParameter = { groupId: 'test', paramKey: 'test', paramValue: '15', ttlSeconds: 0.5 };
const testEntry2: StoredRuntimeParameter = { groupId: 'test', paramKey: 'test1', paramValue: '"not-overridden"', ttlSeconds: 0.5 };

describe('#globalVariableOverrideRuntimeParameterProvider', function () {
  beforeEach(() => {
    mockDynamoRatchet = JestRatchet.mock();
  });

  it('reads underlying entries', async () => {
    Logger.setLevel(LoggerLevelName.silly);
    //mockDynamoRatchet.fullyExecuteQuery.resolves([testEntry, testEntry2]);
    mockDynamoRatchet.simpleGet.mockResolvedValue(testEntry2);
    const drpp: DynamoRuntimeParameterProvider = new DynamoRuntimeParameterProvider(mockDynamoRatchet, 'test-table');
    const er: GlobalVariableOverrideRuntimeParameterProvider = new GlobalVariableOverrideRuntimeParameterProvider(drpp, {
      globalTTL: 1,
      separator: '.',
      prefix: 'p-',
      suffix: null,
    });

    process.env[er.generateName('test', 'test1')] = '"override"';
    const rpr: RuntimeParameterRatchet = new RuntimeParameterRatchet(er);

    const root: StoredRuntimeParameter = await drpp.readParameter('test', 'test1');
    const override: StoredRuntimeParameter = await er.readParameter('test', 'test1');
    const fetched: string = await rpr.fetchParameter<string>('test', 'test1');

    expect(root).not.toBeNull();
    expect(override).not.toBeNull();
    expect(fetched).not.toBeNull();

    expect(root.paramValue).toEqual('"not-overridden"');
    expect(override.paramValue).toEqual('"override"');
    expect(fetched).toEqual('override');
  }, 30_000);
});
