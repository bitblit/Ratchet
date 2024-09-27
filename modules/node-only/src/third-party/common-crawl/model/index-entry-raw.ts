export interface IndexEntryRaw {
  id: string;
  name: string;
  timegate: string; // url
  'cdx-api': string; // url
  from: string; // timestamp (ISO)
  to: string; // timestamp (ISO)
}
