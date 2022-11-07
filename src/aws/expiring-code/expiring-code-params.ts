export interface ExpiringCodeParams {
  context: string;
  timeToLiveSeconds: number;
  length: number;
  alphabet: string;
}
