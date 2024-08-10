import { TransactionStep } from './transaction-step.js';
import { TransactionResult } from './transaction-result.js';
import { TransactionConfiguration } from './transaction-configuration.js';
import { Logger } from '../logger/logger.js';
import { RequireRatchet } from '../lang/require-ratchet.js';
import { LoggerLevelName } from '../logger/logger-level-name.js';
import { TransactionFinalState } from './transaction-final-state.js';

/*
  TransactionRatchet is a framework for executing a series of steps in
  node as a transaction, which is to say, it either executes all the steps in order
  and succeeds completely, or if any step fails (by throwing an exception)
  then the executes all of the rollback steps in reverse order.
*/

export class TransactionRatchet {
  public static async execute<T>(
    steps: TransactionStep<T>[],
    initialContext: T,
    inConfiguration?: TransactionConfiguration<T>,
  ): Promise<TransactionResult<T>> {
    RequireRatchet.notNullOrUndefined(steps, 'steps');
    RequireRatchet.notNullOrUndefined(initialContext, 'initialContext');
    RequireRatchet.true(steps.length > 0, 'steps may not be empty');

    // You must have a config, and it must set a log level
    // Have to copy it here, since the provided one might only have a getter for the log level
    const config: TransactionConfiguration<T> = Object.assign({}, inConfiguration || {});
    config.stepLogLevel = config.stepLogLevel || LoggerLevelName.info;

    const rval: TransactionResult<T> = {
      finalContext: initialContext,
      finalState: null,
    };

    const stepNames: string[] = steps.map((s, idx) => s.name || 'Step ' + idx);

    Logger.info('Beginning transaction of %d steps', steps.length);
    let idx = 0;
    do {
      Logger.logByLevel(config.stepLogLevel, 'Processing step %d of %d (%s)', idx + 1, steps.length, stepNames[idx]);
      try {
        await steps[idx].execute(rval.finalContext, idx);
        idx++;
      } catch (err) {
        Logger.error('Failure detected on step %d : %s : %s : Rolling back', idx, stepNames[idx], err, err);
        rval.error = err;
        rval.errorStep = idx;
      }
    } while (!rval.error && idx < steps.length);

    if (rval.error) {
      // Do rollback
      do {
        Logger.logByLevel(config.stepLogLevel, 'Rolling back step %d of %d (%s)', idx + 1, steps.length, stepNames[idx]);
        try {
          if (steps[idx].rollback) {
            await steps[idx].rollback(rval.finalContext, idx);
          } else {
            Logger.info('Skipping - no rollback defined');
          }
        } catch (err) {
          Logger.error('Very bad - rollback code failed on step %d : %s : Aborting in invalid state: %s', idx, stepNames[idx], err, err);
          rval.rollbackError = err;
          rval.rollbackErrorStep = idx;
        }
        idx--;
      } while (idx >= 0);
    }

    rval.finalState = rval.rollbackError
      ? TransactionFinalState.RollbackFailed
      : rval.error
        ? TransactionFinalState.RolledBack
        : TransactionFinalState.Success;
    Logger.info('Transaction completed with status : %s', rval.finalState);

    if (config?.executeAfterRollback && rval.finalState !== TransactionFinalState.Success) {
      try {
        Logger.info('Applying executeAfterRollback');
        await config.executeAfterRollback(rval);
      } catch (err) {
        Logger.error('Very bad - failure in executeAfterRollback : %s', err, err);
      }
    }

    if (config?.executeAfterRollbackFailure && rval.finalState !== TransactionFinalState.Success) {
      try {
        Logger.info('Applying executeAfterRollbackFailure');
        await config.executeAfterRollbackFailure(rval);
      } catch (err) {
        Logger.error('Very bad - failure in executeAfterRollbackFailure : %s', err, err);
      }
    }

    return rval;
  }
}
