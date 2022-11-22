import { PrototypeDaoDb } from './prototype-dao-db';
import { PrototypeDaoItem } from './prototype-dao-item';

export interface PrototypeDaoProvider<T extends PrototypeDaoItem> {
  storeDatabase(db: PrototypeDaoDb<T>): Promise<boolean>;
  loadDatabase(): Promise<PrototypeDaoDb<T>>;
}
