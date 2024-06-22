// Represents the object used to actually talk to the database, such
// as a Connection object in mysql/maria, an HTTP wrapper for an HTTP db,
// or a AsyncDatabase object in sqlite.  Usually it'll be a wrapper around
// the actual object to act as an adapter
import { QueryResults } from "./query-results";
import { ModifyResults } from "./modify-results";


// T = Class of the connection
// R = Class of any extra connection configuration props
// S = Class of the object returned by a query (data)
export interface DatabaseAccess {
  // Force the connection closed
  close(): Promise<boolean>;
  escape(value: any): string;

  preQuery?(): Promise<void>;
  query<S>(query:string, fields:Record<string,any>): Promise<QueryResults<S>>;
  modify(query:string, fields:Record<string,any>): Promise<ModifyResults>;
  // TODO: Handle DDL specially?
  onQuerySuccessOnly?(): Promise<void>;
  onQueryFailureOnly?(): Promise<void>;
  onQuerySuccessOrFailure?(): Promise<void>;

  beginTransaction?(): Promise<void>;
  commitTransaction?(): Promise<void>;
  rollbackTransaction?(): Promise<void>;

}