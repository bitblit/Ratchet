export interface ExpiringCodeParams {
  context: string;
  timeToLiveSeconds: number;
  tags?: string[];
  length: number;
  alphabet: string;
}
