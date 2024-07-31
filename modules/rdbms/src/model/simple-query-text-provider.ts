import { QueryTextProvider } from "./query-text-provider";
import { StringRatchet } from "@bitblit/ratchet-common";

export class SimpleQueryTextProvider implements QueryTextProvider{
  constructor(private values: Record<string,string>) {
  }

  public fetchQuery(queryDottedPath: string): string {
    let rval: string = null;
    if (StringRatchet.trimToNull(queryDottedPath)) {
      rval= (this.values ??{})[queryDottedPath];
    }
    return rval;
  }

  public fetchAllQueries(): Record<string, string> {
    return Object.assign({}, this.values ?? {});
  }
}