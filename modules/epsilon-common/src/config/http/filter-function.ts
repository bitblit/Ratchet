import { FilterChainContext } from './filter-chain-context.js';

export interface FilterFunction {
  (fCtx: FilterChainContext): Promise<boolean>;
}
