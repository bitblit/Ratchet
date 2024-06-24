import { QueryTextProvider } from "./query-text-provider";
import { StringRatchet } from "@bitblit/ratchet-common";

export class TestingQueryTextProvider implements QueryTextProvider{
  constructor(private value: string) {
  }

  public fetchQuery(queryDottedPath: string): string {
    return StringRatchet.trimToEmpty(queryDottedPath).toLowerCase() === 'default' ? this.value : null;
  }

  public fetchAllQueries(): Record<string, string> {
    return {default:this.value};
  }
}
