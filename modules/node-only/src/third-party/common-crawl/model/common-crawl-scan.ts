import { WarcEntry } from './warc-entry.js';
import { DomainIndexEntryRaw } from './domain-index-entry-raw.js';
import { CommonCrawlFetchOptions } from './common-crawl-fetch-options.js';

export interface CommonCrawlScan {
  options: CommonCrawlFetchOptions;
  //indexes: IndexEntryRaw[];
  pageIndexes: DomainIndexEntryRaw[];
  parsed: WarcEntry[];
  errors: any[];
}
