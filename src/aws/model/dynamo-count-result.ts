/*
Strong typing for results from dynamo db count queries
 */
export interface DynamoCountResult {
  count: number;
  scannedCount: number;
  pages: number;
}
