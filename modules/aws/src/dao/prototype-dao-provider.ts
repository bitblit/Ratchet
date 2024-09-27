import { PrototypeDaoDb } from './prototype-dao-db.js';

export interface PrototypeDaoProvider<T> {
  storeDatabase(db: PrototypeDaoDb<T>): Promise<boolean>;
  loadDatabase(): Promise<PrototypeDaoDb<T>>;
}
