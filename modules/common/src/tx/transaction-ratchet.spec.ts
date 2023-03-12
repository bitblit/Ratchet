import { TransactionStep } from './transaction-step';
import { TransactionRatchet } from './transaction-ratchet';
import { TransactionResult } from './transaction-result';
import { TransactionFinalState } from './transaction-final-state';
import { LoggerLevelName } from '../logger/logger-level-name';

interface TestTransactionContext {
  runningTotal: number;
  failStep?: number;
  failRollbackStep?: number;
  postTxTracker?: number;
}

class TestTransactionStep implements TransactionStep<TestTransactionContext> {
  async execute(context: TestTransactionContext, stepNumber?: number): Promise<void> {
    context.runningTotal += stepNumber;
    if (stepNumber === context?.failStep) {
      throw new Error('Forced error at step ' + stepNumber);
    }
  }

  async rollback(context: TestTransactionContext, stepNumber?: number): Promise<void> {
    context.runningTotal -= stepNumber;
    if (stepNumber === context?.failRollbackStep) {
      throw new Error('Forced rollback error at step ' + stepNumber);
    }
  }
}

describe('#TransactionRatchet.execute', function () {
  it('should return the right value when it executes successfully', async () => {
    const steps: TestTransactionStep[] = [new TestTransactionStep(), new TestTransactionStep(), new TestTransactionStep()];
    const ctx: TestTransactionContext = { runningTotal: 0 };
    const result: TransactionResult<TestTransactionContext> = await TransactionRatchet.execute(steps, ctx);
    expect(result).not.toBeNull();
    expect(result.error).toBeUndefined();
    expect(result.finalState).toEqual(TransactionFinalState.Success);
    expect(result.finalContext.runningTotal).toEqual(3);
  });

  it('should return the right value when it rolls back successfully fail step 2', async () => {
    const steps: TestTransactionStep[] = [new TestTransactionStep(), new TestTransactionStep(), new TestTransactionStep()];
    const ctx: TestTransactionContext = { runningTotal: 0, failStep: 2 };
    const result: TransactionResult<TestTransactionContext> = await TransactionRatchet.execute(steps, ctx);
    expect(result).not.toBeUndefined();
    expect(result.finalState).toEqual(TransactionFinalState.RolledBack);
    expect(result.errorStep).toEqual(2);
    expect(result.error).not.toBeUndefined();
    expect(result.finalContext.runningTotal).toEqual(0);
  });

  it('should return the right value when it rolls back successfully fail step 1', async () => {
    const steps: TestTransactionStep[] = [new TestTransactionStep(), new TestTransactionStep(), new TestTransactionStep()];
    const ctx: TestTransactionContext = { runningTotal: 0, failStep: 2 };
    const result: TransactionResult<TestTransactionContext> = await TransactionRatchet.execute(steps, ctx);
    expect(result).not.toBeUndefined();
    expect(result.finalState).toEqual(TransactionFinalState.RolledBack);
    expect(result.errorStep).toEqual(2);
    expect(result.error).not.toBeUndefined();
    expect(result.finalContext.runningTotal).toEqual(0);
  });

  it('should return the right value the rollback fails', async () => {
    const steps: TestTransactionStep[] = [new TestTransactionStep(), new TestTransactionStep(), new TestTransactionStep()];
    const ctx: TestTransactionContext = { runningTotal: 0, failStep: 2, failRollbackStep: 1 };
    const result: TransactionResult<TestTransactionContext> = await TransactionRatchet.execute(steps, ctx);
    expect(result).not.toBeUndefined();
    expect(result.finalState).toEqual(TransactionFinalState.RollbackFailed);
    expect(result.finalContext.runningTotal).toEqual(0);
    expect(result.errorStep).toEqual(2);
    expect(result.rollbackErrorStep).toEqual(1);
    expect(result.error).not.toBeUndefined();
    expect(result.rollbackError).not.toBeUndefined();
  });

  it('should run the post-error handler when a failure happens', async () => {
    const steps: TestTransactionStep[] = [new TestTransactionStep(), new TestTransactionStep(), new TestTransactionStep()];
    const ctx: TestTransactionContext = { runningTotal: 0, failStep: 2 };
    const result: TransactionResult<TestTransactionContext> = await TransactionRatchet.execute(steps, ctx, {
      executeAfterRollback: async (res) => {
        res.finalContext.postTxTracker = 1;
      },
    });
    expect(result).not.toBeUndefined();
    expect(result.finalState).toEqual(TransactionFinalState.RolledBack);
    expect(result.errorStep).toEqual(2);
    expect(result.error).not.toBeUndefined();
    expect(result.finalContext.postTxTracker).toEqual(1);
  });

  it('should run both post-error handler when a failure happens in both error and rollback', async () => {
    const steps: TestTransactionStep[] = [new TestTransactionStep(), new TestTransactionStep(), new TestTransactionStep()];
    const ctx: TestTransactionContext = { runningTotal: 0, failStep: 2, failRollbackStep: 1 };
    const result: TransactionResult<TestTransactionContext> = await TransactionRatchet.execute(steps, ctx, {
      executeAfterRollback: async (res) => {
        res.finalContext.postTxTracker = 1;
      },
      executeAfterRollbackFailure: async (res) => {
        res.finalContext.postTxTracker += 1;
      },
    });
    expect(result).not.toBeUndefined();
    expect(result.finalState).toEqual(TransactionFinalState.RollbackFailed);
    expect(result.errorStep).toEqual(2);
    expect(result.error).not.toBeUndefined();
    expect(result.finalContext.postTxTracker).toEqual(2);
  });

  it('should still return if a post-tx executor fails', async () => {
    const steps: TestTransactionStep[] = [new TestTransactionStep(), new TestTransactionStep(), new TestTransactionStep()];
    const ctx: TestTransactionContext = { runningTotal: 0, failStep: 2, failRollbackStep: 1 };
    const result: TransactionResult<TestTransactionContext> = await TransactionRatchet.execute(steps, ctx, {
      executeAfterRollback: async (res) => {
        res.finalContext.postTxTracker = 1;
      },
      executeAfterRollbackFailure: async (res) => {
        res.finalContext.postTxTracker += 1;
        throw new Error('Forced tracker failure');
      },
    });
    expect(result).not.toBeUndefined();
    expect(result.finalState).toEqual(TransactionFinalState.RollbackFailed);
    expect(result.errorStep).toEqual(2);
    expect(result.error).not.toBeUndefined();
    expect(result.finalContext.postTxTracker).toEqual(2);
  });

  it('should work with transaction configuration that only provides read log level access', async () => {
    const steps: TestTransactionStep[] = [new TestTransactionStep(), new TestTransactionStep(), new TestTransactionStep()];
    const ctx: TestTransactionContext = { runningTotal: 0, failStep: 2, failRollbackStep: 1 };
    const result: TransactionResult<TestTransactionContext> = await TransactionRatchet.execute(steps, ctx, {
      get stepLogLevel(): LoggerLevelName {
        return LoggerLevelName.info;
      },
      executeAfterRollback: async (res) => {
        res.finalContext.postTxTracker = 1;
      },
      executeAfterRollbackFailure: async (res) => {
        res.finalContext.postTxTracker += 1;
        throw new Error('Forced tracker failure');
      },
    });
    expect(result).not.toBeUndefined();
    expect(result.finalState).toEqual(TransactionFinalState.RollbackFailed);
    expect(result.errorStep).toEqual(2);
    expect(result.error).not.toBeUndefined();
    expect(result.finalContext.postTxTracker).toEqual(2);
  });
});
