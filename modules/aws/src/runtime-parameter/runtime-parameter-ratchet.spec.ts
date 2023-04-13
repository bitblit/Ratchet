import { RuntimeParameterRatchet } from './runtime-parameter-ratchet.js';
import { Logger } from '@bitblit/ratchet-common/dist/logger/logger.js';
import { LoggerLevelName } from '@bitblit/ratchet-common/dist/logger/logger-level-name.js';
import { PromiseRatchet } from '@bitblit/ratchet-common/dist/lang/promise-ratchet.js';
import { StoredRuntimeParameter } from './stored-runtime-parameter.js';
import { MemoryRuntimeParameterProvider } from './memory-runtime-parameter-provider.js';

const testEntry: StoredRuntimeParameter = { groupId: 'test', paramKey: 'test', paramValue: '15', ttlSeconds: 0.5 };
const testEntry2: StoredRuntimeParameter = { groupId: 'test', paramKey: 'test1', paramValue: '20', ttlSeconds: 0.5 };

describe('#runtimeParameterRatchet', function () {
  it('fetch and cache a runtime parameter', async () => {
    Logger.setLevel(LoggerLevelName.silly);
    const mp: MemoryRuntimeParameterProvider = new MemoryRuntimeParameterProvider();
    const rpr: RuntimeParameterRatchet = new RuntimeParameterRatchet(mp);

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

    const cacheMiss: number = await rpr.fetchParameter<number>('test', 'test-miss');
    expect(cacheMiss).toBeNull();

    const cacheDefault: number = await rpr.fetchParameter<number>('test', 'test-miss', 27);
    expect(cacheDefault).toEqual(27);
  }, 30_000);

  it('reads underlying entries', async () => {
    Logger.setLevel(LoggerLevelName.silly);
    const mrpp: MemoryRuntimeParameterProvider = new MemoryRuntimeParameterProvider();
    await mrpp.writeParameter(testEntry);
    await mrpp.writeParameter(testEntry2);

    const rpr: RuntimeParameterRatchet = new RuntimeParameterRatchet(mrpp);

    const vals: StoredRuntimeParameter[] = await rpr.readUnderlyingEntries('test');

    expect(vals).not.toBeFalsy();
    expect(vals.length).toEqual(2);
  }, 30_000);
});
