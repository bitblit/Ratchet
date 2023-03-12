import { TransactionResult } from './transaction-result';
import { LoggerLevelName } from '../logger-support/logger-level-name';

export interface TransactionConfiguration<T> {
  stepLogLevel?: LoggerLevelName;
  executeAfterRollback?(result: TransactionResult<T>): Promise<void>;
  executeAfterRollbackFailure?(result: TransactionResult<T>): Promise<void>;
}
