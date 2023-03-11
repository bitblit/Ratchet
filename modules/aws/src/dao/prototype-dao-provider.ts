import { PrototypeDaoDb } from './prototype-dao-db';

export interface PrototypeDaoProvider<T> {
  storeDatabase(db: PrototypeDaoDb<T>): Promise<boolean>;
  loadDatabase(): Promise<PrototypeDaoDb<T>>;
}
