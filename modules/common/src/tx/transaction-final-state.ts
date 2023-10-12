// NOTE: This is a psuedo-enum to fix some issues with Typescript enums.  See: https://exploringjs.com/tackling-ts/ch_enum-alternatives.html for details
export const TransactionFinalState = {
  Success: 'Success',
  RolledBack: 'RolledBack',
  RollbackFailed: 'RollbackFailed',
};
export type TransactionFinalState = (typeof TransactionFinalState)[keyof typeof TransactionFinalState];
