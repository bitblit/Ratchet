import { FilterChainContext } from './filter-chain-context.js';

export type FilterFunction = (fCtx: FilterChainContext) => Promise<boolean>;
