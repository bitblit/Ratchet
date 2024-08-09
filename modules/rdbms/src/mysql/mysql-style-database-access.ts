import { Connection, ConnectionOptions, FieldPacket, RowDataPacket } from "mysql2/promise";
import { DatabaseAccess } from "../model/database-access";
import { RequestResults } from "../model/request-results";
import { ModifyResults } from "../model/modify-results";
import { DatabaseRequestType } from "../model/database-request-type";
import { Logger } from "@bitblit/ratchet-common/logger/logger";

export class MysqlStyleDatabaseAccess implements DatabaseAccess {

  constructor(private _connection: Connection,private _connectionOptions: ConnectionOptions) {
  }

  public async testConnection(logTestResults?:boolean): Promise<number | null> {
    if (logTestResults) {
      Logger.info('Running connection test');
    }

    const res:RequestResults<any> = await this.query( 'SELECT UNIX_TIMESTAMP(now())*1000 AS test', {});
    const rows = res.results as { test: number }[];
    const timestamp = rows.length === 1 ? rows[0].test : null;
    if (logTestResults) {
      Logger.info('Test returned : %j', timestamp);
    }
    return timestamp;
  }


  public getRawDatabase(): Connection {
    return this._connection;
  }

  public getRawDatabaseConfig(): ConnectionOptions {
    return this._connectionOptions;
  }

  public testConnectionQueryString(): string {
    return "SELECT UNIX_TIMESTAMP(now())*1000 AS test";
  }

  public async close(): Promise<boolean> {
    return Promise.resolve(false);
  }

  public  escape(query: any): string {
    return this._connection.escape(query);
  }

  public async preQuery(): Promise<void> {
    this._connection.config.namedPlaceholders = true;
  }

  public async query<R>(query, fields): Promise<RequestResults<R>> {
    const [rows, outFields] = await this._connection.query(query, fields);

    const castRows: RowDataPacket[] = rows as RowDataPacket[];
    const castFields: FieldPacket[] = outFields;

    const rval: RequestResults<R> = {
      results: castRows as R,
      fields: castFields,
    };

    return rval;
  }

  public async modify(query: string, fields: Record<string, any>): Promise<RequestResults<ModifyResults>> {
    const tmp: RequestResults<ModifyResults> = await this.query(query, fields);
    return tmp;
  }

  public async onRequestSuccessOrFailure(type: DatabaseRequestType): Promise<void> {
    this._connection.config.namedPlaceholders = false;
  }



  /*
  public async onQueryFailureOnly(): Promise<void> {
    return Promise.resolve(undefined);
  }

  public async onQuerySuccessOnly(): Promise<void> {
    return Promise.resolve(undefined);
  }

   */

}
