import { BaseContext, ContextFunction } from '@apollo/server';
import { EpsilonLambdaApolloContextFunctionArgument } from './epsilon-lambda-apollo-context-function-argument.js';
import { ProxyResult } from 'aws-lambda';
import { EpsilonCorsApproach } from "../../../config/http/epsilon-cors-approach.js";

export interface EpsilonLambdaApolloOptions<TContext extends BaseContext> {
  context?: ContextFunction<[EpsilonLambdaApolloContextFunctionArgument], TContext>;
  timeoutMS?: number; // Max time to wait for apollo
  corsMethod?: EpsilonCorsApproach;
  debugOutputCallback?: (resp: ProxyResult) => Promise<void>;
}
