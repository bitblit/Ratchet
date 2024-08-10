import { StoredRuntimeParameter } from "./stored-runtime-parameter.js";
import { Logger } from "@bitblit/ratchet-common/logger/logger";
import { LoggerLevelName } from "@bitblit/ratchet-common/logger/logger-level-name";
import { RuntimeParameterRatchet } from "./runtime-parameter-ratchet.js";
import {
  GlobalVariableOverrideRuntimeParameterProvider
} from "./global-variable-override-runtime-parameter-provider.js";
import { describe, expect, test } from "vitest";
import { MemoryRuntimeParameterProvider } from "./memory-runtime-parameter-provider.js";

const testEntry: StoredRuntimeParameter = { groupId: 'test', paramKey: 'test', paramValue: '15', ttlSeconds: 0.5 };
const testEntry2: StoredRuntimeParameter = { groupId: 'test', paramKey: 'test1', paramValue: '"not-overridden"', ttlSeconds: 0.5 };

describe('#globalVariableOverrideRuntimeParameterProvider', function () {

  test('reads underlying entries', async () => {
    Logger.setLevel(LoggerLevelName.silly);
    //mockDynamoRatchet.fullyExecuteQuery.resolves([testEntry, testEntry2]);
    const drpp: MemoryRuntimeParameterProvider = new MemoryRuntimeParameterProvider();
    await drpp.writeParameter(testEntry);
    await drpp.writeParameter(testEntry2);
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
