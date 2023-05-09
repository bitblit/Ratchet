import { FieldPacket } from 'mysql2';

export interface MysqlResultsWrapper<T> {
  results: T;
  fields: FieldPacket[];
}
