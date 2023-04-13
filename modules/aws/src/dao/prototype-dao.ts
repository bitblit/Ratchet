import { RequireRatchet } from '@bitblit/ratchet-common/dist/lang/require-ratchet.js';
import { StringRatchet } from '@bitblit/ratchet-common/dist/lang/string-ratchet.js';
import { MapRatchet } from '@bitblit/ratchet-common/dist/lang/map-ratchet.js';
import { PrototypeDaoProvider } from './prototype-dao-provider.js';
import { PrototypeDaoDb } from './prototype-dao-db.js';
import { PrototypeDaoConfig } from './prototype-dao-config.js';
import { DateTime } from 'luxon';

/*
  PrototypeDao makes it quick to stand up a simple data access object
  key/value store backed by something simple (usually a file in S3).

  It is slow and not very powerful, but is meant to be stood up rapidly, and then
  replaced once you have something useful to do the Dao's job

  Note this thing pulls the WHOLE DB for every single operation.  You really don't wanna use it
  for anything like serious workloads

 */
export class PrototypeDao<T> {
  public static defaultDaoConfig(): PrototypeDaoConfig {
    return {
      guidCreateFunction: StringRatchet.createType4Guid,
      guidFieldName: 'guid',
      createdEpochMSFieldName: 'createdEpochMS',
      updatedEpochMSFieldName: 'updatedEpochMS',
      createdUtcTimestampFieldName: null,
      updatedUtcTimestampFieldName: null,
    };
  }

  constructor(private provider: PrototypeDaoProvider<T>, private cfg: PrototypeDaoConfig = PrototypeDao.defaultDaoConfig()) {
    RequireRatchet.notNullOrUndefined(provider, 'provider');
    RequireRatchet.notNullOrUndefined(cfg, 'cfg');
    RequireRatchet.notNullOrUndefined(cfg.guidCreateFunction, 'cfg.guidCreateFunction');
    RequireRatchet.notNullOrUndefined(cfg.guidFieldName, 'cfg.guidFieldName');
  }

  public async fetchAll(): Promise<T[]> {
    const db: PrototypeDaoDb<T> = await this.provider.loadDatabase();
    return db.items || [];
  }

  public async resetDatabase(): Promise<void> {
    await this.provider.storeDatabase({ items: [], lastModifiedEpochMS: Date.now() });
  }

  public async removeItems(guids: string[]): Promise<T[]> {
    let old: T[] = await this.fetchAll();
    if (guids) {
      old = old.filter((t) => !guids.includes(t[this.cfg.guidFieldName]));
      await this.provider.storeDatabase({ items: old, lastModifiedEpochMS: Date.now() });
    }
    return old;
  }

  public async store(value: T): Promise<T> {
    let old: T[] = await this.fetchAll();
    if (value) {
      value[this.cfg.guidFieldName] = value[this.cfg.guidFieldName] || this.cfg.guidCreateFunction();
      if (this.cfg.createdEpochMSFieldName) {
        value[this.cfg.createdEpochMSFieldName] = value[this.cfg.createdEpochMSFieldName] || Date.now();
      }
      if (this.cfg.createdUtcTimestampFieldName) {
        value[this.cfg.createdUtcTimestampFieldName] = value[this.cfg.createdUtcTimestampFieldName] || DateTime.utc().toISO();
      }
      if (this.cfg.updatedEpochMSFieldName) {
        value[this.cfg.updatedEpochMSFieldName] = Date.now();
      }
      if (this.cfg.updatedUtcTimestampFieldName) {
        value[this.cfg.updatedUtcTimestampFieldName] = DateTime.utc().toISO();
      }
      old = old.filter((t) => t[this.cfg.guidFieldName] !== value[this.cfg.guidFieldName]);
      old.push(value);
      await this.provider.storeDatabase({ items: old, lastModifiedEpochMS: Date.now() });
    }
    return value;
  }

  public async fetchById(guid: string): Promise<T> {
    const old: T[] = await this.fetchAll();
    return old.find((t) => t[this.cfg.guidFieldName] === guid);
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
