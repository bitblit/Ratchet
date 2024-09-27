export interface WarcEntryRaw {
  protocol: string;
  headers: Record<string, string>;
  content: Buffer;
}
