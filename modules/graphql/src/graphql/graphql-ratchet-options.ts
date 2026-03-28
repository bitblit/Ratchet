import { GraphqlRatchetEndpointProvider } from './provider/graphql-ratchet-endpoint-provider.js';
import { GraphqlRatchetJwtTokenProvider } from './provider/graphql-ratchet-jwt-token-provider.js';
import { GraphqlRatchetQueryProvider } from './provider/graphql-ratchet-query-provider.js';
import { GraphqlRatchetErrorHandler } from './provider/graphql-ratchet-error-handler.js';

export interface GraphqlRatchetOptions {
  queryProvider: GraphqlRatchetQueryProvider;
  endpointProvider: GraphqlRatchetEndpointProvider;
  jwtTokenProvider?: GraphqlRatchetJwtTokenProvider;
  errorHandler?: GraphqlRatchetErrorHandler;
}

