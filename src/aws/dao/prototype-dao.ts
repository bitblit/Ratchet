import { MapRatchet, RequireRatchet, StringRatchet } from '../../common';
import { PrototypeDaoProvider } from './prototype-dao-provider';
import { PrototypeDaoDb } from './prototype-dao-db';
import { PrototypeDaoItem } from './prototype-dao-item';

/*
  PrototypeDao makes it quick to stand up a simple data access object
  key/value store backed by something simple (usually a file in S3).

  It is slow and not very powerful, but is meant to be stood up rapidly, and then
  replaced once you have something useful to do the Dao's job

  Note this thing pulls the WHOLE DB for every single operation.  You really don't wanna use it
  for anything like serious workloads

 */
export class PrototypeDao<T extends PrototypeDaoItem> {
  constructor(private provider: PrototypeDaoProvider<T>) {
    RequireRatchet.notNullOrUndefined(provider, 'provider');
  }

  public async fetchAll(): Promise<T[]> {
    const db: PrototypeDaoDb<T> = await this.provider.loadDatabase();
    return db.items;
  }

  public async resetDatabase(): Promise<void> {
    await this.provider.storeDatabase({ items: [], lastModifiedEpochMS: Date.now() });
  }

  public async removeItems(guids: string[]): Promise<T[]> {
    let old: T[] = await this.fetchAll();
    if (guids) {
      old = old.filter((t) => !guids.includes(t.guid));
      await this.provider.storeDatabase({ items: old, lastModifiedEpochMS: Date.now() });
    }
    return old;
  }

  public async store(value: T): Promise<T[]> {
    let old: T[] = await this.fetchAll();
    if (value) {
      value.guid = value.guid || StringRatchet.createType4Guid();
      value.createdEpochMS = value.createdEpochMS || Date.now();
      value.updatedEpochMS = Date.now();
      old = old.filter((t) => t.guid !== value.guid);
      old.push(value);
      await this.provider.storeDatabase({ items: old, lastModifiedEpochMS: Date.now() });
    }
    return old;
  }

  public async fetchById(guid: string): Promise<T> {
    const old: T[] = await this.fetchAll();
    return old.find((t) => t.guid === guid);
  }

  public async searchByField<R>(fieldDotPath: string, fieldValue: R): Promise<T[]> {
    RequireRatchet.notNullOrUndefined(fieldDotPath, 'fieldDotPath');
    RequireRatchet.notNullOrUndefined(fieldValue, 'fieldValue');
    const map: Record<string, any> = {};
    map[fieldDotPath] = fieldValue;
    return this.searchByFieldMap(map);
  }

  public async searchByFieldMap(input: Record<string, any>): Promise<T[]> {
    RequireRatchet.notNullOrUndefined(input, 'input');
    let old: T[] = await this.fetchAll();
    old = old.filter((t) => {
      let matchAll: boolean = true;
      Object.keys(input).forEach((k) => {
        const val: any = MapRatchet.findValueDotPath(t, k);
        const fieldValue: any = input[k];
        matchAll = matchAll && val === fieldValue;
      });
      return matchAll;
    });
    return old;
  }
}
