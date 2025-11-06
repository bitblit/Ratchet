export interface RdsDataApiConnectionConfig {
  label: string;
  resourceArn: string;
  secretArn: string;
  database: string;
  maximumWaitForDbResumeInMillis?: number;
  dbResumePingTimeMillis?: number;
}
