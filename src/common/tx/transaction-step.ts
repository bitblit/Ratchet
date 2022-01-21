export interface TransactionStep<T> {
  execute(context: T, stepNumber?: number): Promise<void>;
  rollback?(context: T, stepNumber?: number): Promise<void>;
  name?: string;
}
