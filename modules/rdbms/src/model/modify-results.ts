export interface ModifyResults {
  changedRows: number;
  insertId?: number;
  fieldCount?: number;
  affectedRows?: number;
  info?: string;
  serverStatus?: number;
  warningStatus?: number;
}
