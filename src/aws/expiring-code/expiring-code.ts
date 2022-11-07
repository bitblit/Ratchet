export interface ExpiringCode {
  code: string;
  context: string;
  expiresEpochMS: number;
}
