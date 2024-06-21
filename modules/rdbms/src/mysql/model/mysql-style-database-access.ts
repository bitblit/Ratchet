import { Connection, ConnectionOptions, QueryResult, RowDataPacket } from "mysql2/promise";
import { DatabaseAccess } from "../../model/database-access";
import { FieldPacket } from "mysql2";
import { QueryResults } from "../../model/query-results";

export class MysqlStyleDatabaseAccess implements DatabaseAccess {

  constructor(private _connection: Connection,private _connectionOptions: ConnectionOptions) {
  }

  public getRawDatabase(): Connection {
    return this._connection;
  }

  public getRawDatabaseConfig(): ConnectionOptions {
    return this._connectionOptions;
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

  public async query<R>(query, fields): Promise<QueryResults<R>> {
    const [rows, outFields] = await this._connection.query(query, fields);

    const castRows: RowDataPacket[] = rows as RowDataPacket[];
    const castFields: FieldPacket[] = outFields;

    const rval: QueryResults<R> = {
      results: castRows as R,
      fields: castFields,
    };


    return rval;
  }

  public async onQuerySuccessOrFailure(): Promise<void> {
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
