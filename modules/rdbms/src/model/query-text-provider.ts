export interface QueryTextProvider {
  fetchQuery(queryDottedPath: string): string;
  fetchAllQueries(): Record<string, string>;
}
