import { PrototypeDaoItem } from './prototype-dao-item';

export interface PrototypeDaoDb<T extends PrototypeDaoItem> {
  items: T[];
  lastModifiedEpochMS: number;
}
