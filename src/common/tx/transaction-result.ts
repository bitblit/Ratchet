import {TransactionFinalState} from './transaction-final-state';

export interface TransactionResult<T> {
  finalContext: T;
  finalState: TransactionFinalState;
  error?: any; // Contains the error that initiated the rollback, if any
  rollbackError?: any; // If an exception was thrown during rollback (this is very bad)
  errorStep?: number; // If the tx failed, it failed at this step
  rollbackErrorStep?: number; // If the rollback failed, it failed at this step
}
