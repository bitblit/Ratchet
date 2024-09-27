export interface ExpiringCode {
  code: string;
  context: string;
  expiresEpochMS: number;
  tags?: string[];
}
