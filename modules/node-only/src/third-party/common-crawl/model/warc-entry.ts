export interface WarcEntry {
  protocol: string;
  headers: Record<string, string>;
  content: string;
}
