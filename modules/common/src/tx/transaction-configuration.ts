import { TransactionResult } from './transaction-result.js';
import { LoggerLevelName } from '../logger/logger-level-name.js';

export interface TransactionConfiguration<T> {
  stepLogLevel?: LoggerLevelName;
  executeAfterRollback?(result: TransactionResult<T>): Promise<void>;
  executeAfterRollbackFailure?(result: TransactionResult<T>): Promise<void>;
}
