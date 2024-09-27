export interface DomainIndexEntryRaw {
  urlkey: string;
  timestamp: string; // number
  url: string;
  mime: string;
  'mime-detected': string;
  status: string; //number
  digest: string;
  length: string; //number,
  offset: string; //number
  filename: string;
  languages: string;
  encoding: string;
}
