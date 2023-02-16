// CAW: 2022-08-24 : You must import from @apollo/client/core instead of @apollo/client if you don't wanna drag in React...
// They are gonna fix this in v4 :https://github.com/apollographql/apollo-client/issues/8190
import { ApolloClient, ApolloClientOptions, ApolloLink, ApolloQueryResult, gql, HttpLink, InMemoryCache } from '@apollo/client/core';
import { ExecutionResult } from 'graphql';
import { Logger } from '../common/logger';
import { StringRatchet } from '../common/string-ratchet';
import { ErrorRatchet } from '../common/error-ratchet';
import { RequireRatchet } from '../common/require-ratchet';
import { GraphqlRatchetEndpointProvider } from './provider/graphql-ratchet-endpoint-provider';
import { GraphqlRatchetJwtTokenProvider } from './provider/graphql-ratchet-jwt-token-provider';
import { GraphqlRatchetQueryProvider } from './provider/graphql-ratchet-query-provider';
import { GraphqlRatchetErrorHandler } from './provider/graphql-ratchet-error-handler';
import { DefaultGraphqlRatchetErrorHandler } from './provider/default-graphql-ratchet-error-handler';

/**
 * CAW: 2023-02-16 : I'm well aware that this ratchet currently blows away any useful caching done by
 * ApolloClient, and that it is a terrible idea.  It's mainly because the kinds of things I use this
 * for get very little useful behavior out of caching, so I've never tuned it.  At some point in the
 * future I'll have to build that out more (likely with some interfaces)
 */
export class GraphqlRatchet {
  private apolloCache: Map<string, ApolloClient<any>> = new Map<string, ApolloClient<any>>();
  private noAuthApollo: ApolloClient<any>;

  private cachedEndpoint: string;

  constructor(
    private queryProvider: GraphqlRatchetQueryProvider,
    private endpointProvider: GraphqlRatchetEndpointProvider,
    private jwtTokenProvider: GraphqlRatchetJwtTokenProvider,
    private errorHandler: GraphqlRatchetErrorHandler = new DefaultGraphqlRatchetErrorHandler()
  ) {
    RequireRatchet.notNullOrUndefined(queryProvider, 'queryProvider');
    RequireRatchet.notNullOrUndefined(endpointProvider, 'endpointProvider');
    RequireRatchet.notNullOrUndefined(jwtTokenProvider, 'jwtTokenProvider');
    RequireRatchet.notNullOrUndefined(errorHandler, 'errorHandler');
    this.cachedEndpoint = this.endpointProvider.fetchGraphqlEndpoint();
  }

  private async fetchQueryAsGql(qry: string): Promise<any> {
    let rval: any = null;
    const text: string = await this.queryProvider.fetchQueryText(qry);
    if (text) {
      rval = gql(text);
    }
    return rval;
  }

  private createAnonymousApi(): ApolloClient<any> {
    Logger.info('Creating anonymous apollo client');
    const httpLink = new HttpLink({ uri: this.cachedEndpoint });

    const opts: ApolloClientOptions<any> = {
      link: httpLink,
      cache: new InMemoryCache(),
    };

    const rval: ApolloClient<any> = new ApolloClient<any>(opts);
    return rval;
  }

  private fetchApi(runAnonymous: boolean): ApolloClient<any> {
    let rval: ApolloClient<any> = null;
    const jwtToken: string = this.jwtTokenProvider.fetchJwtToken();
    this.checkIfEndpointChanged(); // Always check for cache invalidation first...
    Logger.info('Fetch auth apollo client %s', StringRatchet.obscure(StringRatchet.trimToEmpty(jwtToken), 2, 2));

    if (StringRatchet.trimToNull(jwtToken)) {
      if (!this.apolloCache.get(jwtToken)) {
        this.apolloCache.set(jwtToken, this.createAuthApi(jwtToken));
      }
      rval = this.apolloCache.get(jwtToken);
    } else {
      if (runAnonymous) {
        if (!this.noAuthApollo) {
          this.noAuthApollo = this.createAnonymousApi();
        }
        rval = this.noAuthApollo;
      } else {
        ErrorRatchet.throwFormattedErr('Cannot fetch api - no token and runAnonymous is set to false');
      }
    }
    return rval;
  }

  private createAuthApi(jwtToken: string): ApolloClient<any> {
    let rval: ApolloClient<any> = null;
    RequireRatchet.notNullUndefinedOrOnlyWhitespaceString(jwtToken, 'jwtToken');
    Logger.info('Creating auth apollo client %s', StringRatchet.obscure(jwtToken, 2, 2));
    const httpLink = new HttpLink({ uri: this.cachedEndpoint });

    const authLink = new ApolloLink((operation, forward) => {
      // Use the setContext method to set the HTTP headers.
      operation.setContext({
        headers: {
          authorization: `Bearer ${jwtToken}`,
        },
      });

      // Call the next link in the middleware chain.
      return forward(operation);
    });

    const opts: ApolloClientOptions<any> = {
      link: authLink.concat(httpLink),
      cache: new InMemoryCache(),
    };

    rval = new ApolloClient<any>(opts);
    return rval;
  }

  private checkIfEndpointChanged(): void {
    const check: string = this.endpointProvider.fetchGraphqlEndpoint();
    if (check !== this.cachedEndpoint) {
      Logger.info('Endpoint changed from %s to %s - clearing apollo caches');
      this.apolloCache = new Map<string, ApolloClient<any>>();
      this.noAuthApollo = null;
      this.cachedEndpoint = check;
    }
  }

  public async executeQuery<T>(queryName: string, variables: Record<string, any>, runAnonymous: boolean = false): Promise<T> {
    let rval: T = null;
    try {
      const api: ApolloClient<any> = this.fetchApi(runAnonymous);
      if (api) {
        const GQL = await this.fetchQueryAsGql(queryName);
        const newValues: ApolloQueryResult<any> = await api.query<any>({
          query: GQL,
          variables: variables,
          fetchPolicy: 'no-cache',
        });

        Logger.silly('Query returned: %j', newValues);
        const keys: string[] = Object.keys(newValues.data);
        if (keys.length !== 1) {
          ErrorRatchet.throwFormattedErr('Unexpected number of keys : %s : %j', keys.length, keys);
        }
        rval = newValues.data[keys[0]];
      } else {
        ErrorRatchet.throwFormattedErr('Cannot run - no api fetched');
      }
    } catch (err) {
      this.errorHandler.handleError(err, queryName, variables, runAnonymous);
    }
    return rval;
  }

  public async executeMutate<T>(queryName: string, variables: any, runAnonymous: boolean = false): Promise<T> {
    Logger.info('Mutate : %s : %j', queryName, variables);
    let rval: T = null;
    const api: ApolloClient<any> = this.fetchApi(runAnonymous);
    try {
      if (api) {
        const GQL = await this.fetchQueryAsGql(queryName);
        const newValues: ExecutionResult<T> = await api.mutate<any>({
          mutation: GQL,
          variables: variables,
          fetchPolicy: 'no-cache',
        });

        const keys: string[] = Object.keys(newValues.data);
        if (keys.length !== 1) {
          ErrorRatchet.throwFormattedErr('Unexpected number of keys : %s : %j', keys.length, keys);
        }
        rval = newValues.data[keys[0]];
      } else {
        ErrorRatchet.throwFormattedErr('Cannot run - no api fetched');
      }
    } catch (err) {
      this.errorHandler.handleError(err, queryName, variables, runAnonymous);
    }

    return rval;
  }
}
