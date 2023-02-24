import { PrototypeDao } from './prototype-dao';
import { S3PrototypeDaoProvider } from './s3-prototype-dao-provider';
import { S3CacheRatchet } from '../s3-cache-ratchet';
import { S3 } from '@aws-sdk/client-s3';

describe('#PrototypeDao', () => {
  xit('Should save/load files', async () => {
    const svc: PrototypeDao<TestPrototypeItem> = new PrototypeDao<TestPrototypeItem>(
      new S3PrototypeDaoProvider(new S3CacheRatchet(new S3({}), 'some-bucket'), 'test-data.json')
    );
    await svc.resetDatabase();

    await svc.store({ fieldA: 1, fieldB: 'test1', type: 'a' });
    await svc.store({ fieldA: 2, fieldB: 'test2', type: 'a' });
    await svc.store({ fieldA: 2, fieldB: 'test3', type: 'b' });
    await svc.store({ guid: 'forceGuid', fieldA: 4, fieldB: 'test4', type: 'c' });

    const test1: TestPrototypeItem[] = await svc.fetchAll();
    expect(test1.length).toBe(4);

    const test2: TestPrototypeItem = await svc.fetchById('forceGuid');
    expect(test2).not.toBeNull();
    expect(test2.createdEpochMS).not.toBeNull();
    expect(test2.updatedEpochMS).not.toBeNull();

    const test3: TestPrototypeItem[] = await svc.searchByField('fieldA', 4);
    expect(test3.length).toBe(1);
    expect(test3[0].guid).toEqual('forceGuid');

    const test4: TestPrototypeItem[] = await svc.searchByFieldMap({ type: 'a', fieldA: 2 });
    expect(test4.length).toBe(1);

    await svc.resetDatabase();
  }, 300_000);
});

export interface TestPrototypeItem {
  fieldA: number;
  fieldB: string;
  type: string;
  createdEpochMS?: number;
  updatedEpochMS?: number;
  guid?: string;
}
