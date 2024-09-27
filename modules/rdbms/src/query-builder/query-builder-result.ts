import { TransactionIsolationLevel } from '../model/transaction-isolation-level.js';
import { Paginator } from '../model/paginator.js';

export class QueryBuilderResult {
  query: string;
  namedParams: Record<string, unknown>;
  paginator?: Paginator<any>;
  transactionIsolationLevel: TransactionIsolationLevel;

  constructor(
    query: string,
    namedParams: Record<string, unknown>,
    paginator: Paginator<any> | undefined,
    transactionIsolationLevel: TransactionIsolationLevel,
  ) {
    this.query = query;
    this.namedParams = namedParams;
    this.paginator = paginator;
    this.transactionIsolationLevel = transactionIsolationLevel;
  }
}
