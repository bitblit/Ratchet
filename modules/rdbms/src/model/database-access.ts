// Represents the object used to actually talk to the database, such
// as a Connection object in mysql/maria, an HTTP wrapper for an HTTP db,
// or a AsyncDatabase object in sqlite.  Usually it'll be a wrapper around
// the actual object to act as an adapter
import { RequestResults } from "./request-results";
import { ModifyResults } from "./modify-results";
import { DatabaseRequestType } from "./database-request-type";


// T = Class of the connection
// R = Class of any extra connection configuration props
// S = Class of the object returned by a query (data)
export interface DatabaseAccess {
  // Force the connection closed
  close(): Promise<boolean>;
  escape(value: any): string;

  testConnection(logTestResults?: boolean): Promise<number>; // Should be a fast test like 'select 1'

  preQuery?(): Promise<void>;
  query<S>(query:string, fields:Record<string,any>): Promise<RequestResults<S>>;
  modify(query:string, fields:Record<string,any>): Promise<RequestResults<ModifyResults>>;
  // TODO: Handle DDL specially?
  onRequestSuccessOnly?(type: DatabaseRequestType): Promise<void>;
  onRequestFailureOnly?(type: DatabaseRequestType): Promise<void>;
  onRequestSuccessOrFailure?(type: DatabaseRequestType): Promise<void>;

  beginTransaction?(): Promise<void>;
  commitTransaction?(): Promise<void>;
  rollbackTransaction?(): Promise<void>;

}