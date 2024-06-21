export interface MysqlMasterStatus {
  File: string;
  Position: number;
  Binlog_Do_DB: string;
  Binlog_Ignore_DB: string;
}
