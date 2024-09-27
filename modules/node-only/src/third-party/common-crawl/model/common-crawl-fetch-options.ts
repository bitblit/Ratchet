export interface CommonCrawlFetchOptions {
  url: string;
  index?: string;
  from?: string;
  to?: string;
  showNumPages?: boolean;
  matchType?: 'exact' | 'prefix' | 'host' | 'domain';
  limit?: number;
  sort?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}
