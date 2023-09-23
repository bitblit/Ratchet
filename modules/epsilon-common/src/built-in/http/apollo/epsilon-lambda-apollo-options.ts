import { BaseContext, ContextFunction } from '@apollo/server';
import { EpsilonLambdaApolloContextFunctionArgument } from './epsilon-lambda-apollo-context-function-argument.js';
import { EpsilonApolloCorsMethod } from './epsilon-apollo-cors-method.js';
import { ProxyResult } from 'aws-lambda';

export interface EpsilonLambdaApolloOptions<TContext extends BaseContext> {
  context?: ContextFunction<[EpsilonLambdaApolloContextFunctionArgument], TContext>;
  timeoutMS?: number; // Max time to wait for apollo
  corsMethod?: EpsilonApolloCorsMethod;
  debugOutputCallback?: (resp: ProxyResult) => Promise<void>;
}
