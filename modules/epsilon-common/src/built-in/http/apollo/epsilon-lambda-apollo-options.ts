import { BaseContext, ContextFunction } from '@apollo/server';
import { EpsilonLambdaApolloContextFunctionArgument } from './epsilon-lambda-apollo-context-function-argument.js';

export interface EpsilonLambdaApolloOptions<TContext extends BaseContext> {
  context?: ContextFunction<[EpsilonLambdaApolloContextFunctionArgument], TContext>;
  timeoutMS?: number; // Max time to wait for apollo
}
