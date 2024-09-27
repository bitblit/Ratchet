import { BackgroundProcessor } from './background-processor.js';
import { BackgroundErrorProcessor } from './background-error-processor.js';
import { BackgroundExecutionListener } from '../../background/background-execution-listener.js';
import { BackgroundTransactionLogger } from './background-transaction-logger.js';

export interface BackgroundConfig {
  transactionLogger?: BackgroundTransactionLogger;
  errorProcessor?: BackgroundErrorProcessor;
  httpStatusEndpoint?: string;
  httpMetaEndpoint?: string;
  httpSubmissionPath: string;
  implyTypeFromPathSuffix: boolean;
  processors: BackgroundProcessor<any>[];
  executionListeners?: BackgroundExecutionListener<any>[];
}
