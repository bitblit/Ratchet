import { PrototypeDao } from './prototype-dao.js';
import { describe, expect, test } from 'vitest';
import { MemoryPrototypeDaoProvider } from './memory-prototype-dao-provider.js';
import { ExamplePrototypeDaoItem } from './example-prototype-dao-item.js';

describe('#PrototypeDao', () => {
  test.skip('Should save/load files', async () => {
    const svc: PrototypeDao<ExamplePrototypeDaoItem> = new PrototypeDao<ExamplePrototypeDaoItem>(new MemoryPrototypeDaoProvider());
    await svc.resetDatabase();

    await svc.store({ fieldA: 1, fieldB: 'test1', type: 'a' });
    await svc.store({ fieldA: 2, fieldB: 'test2', type: 'a' });
    await svc.store({ fieldA: 2, fieldB: 'test3', type: 'b' });
    await svc.store({ guid: 'forceGuid', fieldA: 4, fieldB: 'test4', type: 'c' });

    const test1: ExamplePrototypeDaoItem[] = await svc.fetchAll();
    expect(test1.length).toBe(4);

    const test2: ExamplePrototypeDaoItem = await svc.fetchById('forceGuid');
    expect(test2).not.toBeNull();
    expect(test2.createdEpochMS).not.toBeNull();
    expect(test2.updatedEpochMS).not.toBeNull();

    const test3: ExamplePrototypeDaoItem[] = await svc.searchByField('fieldA', 4);
    expect(test3.length).toBe(1);
    expect(test3[0].guid).toEqual('forceGuid');

    const test4: ExamplePrototypeDaoItem[] = await svc.searchByFieldMap({ type: 'a', fieldA: 2 });
    expect(test4.length).toBe(1);

    await svc.resetDatabase();
  }, 300_000);
});
