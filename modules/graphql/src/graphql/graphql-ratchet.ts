import { GraphqlRatchetEndpointProvider } from './provider/graphql-ratchet-endpoint-provider.js';
import { GraphqlRatchetJwtTokenProvider } from './provider/graphql-ratchet-jwt-token-provider.js';
import { GraphqlRatchetQueryProvider } from './provider/graphql-ratchet-query-provider.js';
import { GraphqlRatchetErrorHandler } from './provider/graphql-ratchet-error-handler.js';
import { DefaultGraphqlRatchetErrorHandler } from './provider/default-graphql-ratchet-error-handler.js';

import { RequireRatchet } from '@bitblit/ratchet-common/lang/require-ratchet';
import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { ErrorRatchet } from '@bitblit/ratchet-common/lang/error-ratchet';
import { StringRatchet } from '@bitblit/ratchet-common/lang/string-ratchet';
import { GraphQLClient, RequestDocument } from 'graphql-request';

/**
 * This is a very simplistic client for non-cache use cases, etc.  For more
 * powerful clients, use a library like Apollo-client
 */
export class GraphqlRatchet {
  private clientCache: Map<string, GraphQLClient> = new Map<string, GraphQLClient>();
  private noAuthClient: GraphQLClient;

  private cachedEndpoint: string;

  constructor(
    private queryProvider: GraphqlRatchetQueryProvider,
    private endpointProvider: GraphqlRatchetEndpointProvider,
    private jwtTokenProvider?: GraphqlRatchetJwtTokenProvider,
    private errorHandler: GraphqlRatchetErrorHandler = new DefaultGraphqlRatchetErrorHandler(),
  ) {
    RequireRatchet.notNullOrUndefined(queryProvider, 'queryProvider');
    RequireRatchet.notNullOrUndefined(endpointProvider, 'endpointProvider');
    //RequireRatchet.notNullOrUndefined(jwtTokenProvider, 'jwtTokenProvider');
    RequireRatchet.notNullOrUndefined(errorHandler, 'errorHandler');
    this.cachedEndpoint = this.endpointProvider.fetchGraphqlEndpoint();
  }

  private async fetchQueryText(qry: string): Promise<string> {
    const text: string = await this.queryProvider.fetchQueryText(qry);
    if (!text) {
      Logger.warn('Could not find requested query : %s', qry);
    }
    return  text
  }

  private createAnonymousApi(): GraphQLClient {
    Logger.info('Creating anonymous GraphQLClient');
    const rval: GraphQLClient = new GraphQLClient(this.cachedEndpoint, {errorPolicy: 'all'});
    return rval;
  }

  private fetchApi(runAnonymous: boolean): GraphQLClient {
    let rval: GraphQLClient = null;
    if (!runAnonymous && !this.jwtTokenProvider) {
      throw ErrorRatchet.fErr('If no jwtTokenProvider is set, you must run anonymous');
    }
    const jwtToken: string = runAnonymous?null:this.jwtTokenProvider.fetchJwtToken();
    this.checkIfEndpointChanged(); // Always check for cache invalidation first...
    Logger.info('Fetch auth client %s', StringRatchet.obscure(StringRatchet.trimToEmpty(jwtToken), 2, 2));

    if (StringRatchet.trimToNull(jwtToken)) {
      Logger.debug('Fetching authd api');
      if (!this.clientCache.has(jwtToken)) {
        const newValue: GraphQLClient = this.createAuthApi(jwtToken);
        Logger.debug('Setting cache for this token to %s', newValue);
        this.clientCache.set(jwtToken, newValue);
      } else {
        Logger.debug('Fetching apollo client from cache');
      }
      rval = this.clientCache.get(jwtToken);
    } else {
      Logger.debug('Fetching unauthd ap');
      if (runAnonymous) {
        if (!this.noAuthClient) {
          this.noAuthClient = this.createAnonymousApi();
        } else {
          Logger.debug('Fetching anonymous client from cache');
        }
        rval = this.noAuthClient;
      } else {
        ErrorRatchet.throwFormattedErr('Cannot fetch api - no token and runAnonymous is set to %s : -%s-', runAnonymous, jwtToken);
      }
    }
    Logger.debug('FetchApi returning %s', rval);
    return rval;
  }

  private createAuthApi(jwtToken: string): GraphQLClient {
    Logger.info('Creating a new authenticated api for %s : %s', this.cachedEndpoint, StringRatchet.obscure(jwtToken, 2, 2));
    RequireRatchet.notNullUndefinedOrOnlyWhitespaceString(jwtToken, 'jwtToken');
    Logger.info('Creating auth apollo client %s', StringRatchet.obscure(jwtToken, 2, 2));
    const rval: GraphQLClient = new GraphQLClient(this.cachedEndpoint, {errorPolicy: 'all', headers: {authorization: `Bearer ${jwtToken}`}});
    return rval;
  }

  private checkIfEndpointChanged(): void {
    const check: string = this.endpointProvider.fetchGraphqlEndpoint();
    if (check !== this.cachedEndpoint) {
      Logger.info('Endpoint changed from %s to %s - clearing apollo caches');
      this.clientCache = new Map<string, GraphQLClient>();
      this.noAuthClient = null;
      this.cachedEndpoint = check;
    }
  }

  public clearCaches(): void {
    Logger.info('Clearing cached apollo');
    this.clientCache = new Map<string, GraphQLClient>();
    this.noAuthClient = null;
    this.cachedEndpoint = null;
  }

  public static extractSingleValueFromResponse<T>(resp: any): T {
    const data: any = resp?.data;
    if (!data) {
      throw ErrorRatchet.fErr('Could not find key "data" in : %j', resp);
    }
    const keys: string[] = Object.keys(data);
    if (keys.length !== 1) {
      ErrorRatchet.throwFormattedErr('Unexpected number of keys : %s : %j', keys.length, keys);
    }
    const rval: T = data[keys[0]];
    return rval;
  }

  public async executeQuery<T>(queryName: string, variables: Record<string, any>, runAnonymous: boolean = false): Promise<T> {
    let rval: T = null;
    try {
      const api: GraphQLClient = this.fetchApi(runAnonymous);
      if (api) {
        Logger.debug('API fetched for %s, fetching gql', queryName);
        const gql: string = await this.fetchQueryText(queryName);
        Logger.debug('API and GQL fetched for %s - running %s %s', queryName, gql, api);
        const newValues: any = await api.request(gql, variables);
        rval = GraphqlRatchet.extractSingleValueFromResponse(newValues);
        Logger.silly('Query returned: %j', rval);
      } else {
        ErrorRatchet.throwFormattedErr('Cannot run - no api fetched');
      }
    } catch (err) {
      Logger.silly('Exception caught in executeQuery : %s %s %j %s', err, queryName, variables, runAnonymous, err);
      this.errorHandler.handleError(err, queryName, variables, runAnonymous);
    }
    return rval;
  }

  public async executeMutate<T>(queryName: string, variables: any, runAnonymous: boolean = false): Promise<T> {
    Logger.info('Mutate : %s : %j', queryName, variables);
    let rval: T = null;
    const api: GraphQLClient = this.fetchApi(runAnonymous);
    try {
      if (api) {
        const gql: string = await this.fetchQueryText(queryName);
        Logger.debug('API and GQL fetched for %s - running %s %s', queryName, gql, api);
        const newValues: any = await api.request(gql, variables);
        rval = GraphqlRatchet.extractSingleValueFromResponse(newValues);
        Logger.silly('Mutate returned: %j', rval);
      } else {
        ErrorRatchet.throwFormattedErr('Cannot run - no api fetched');
      }
    } catch (err) {
      this.errorHandler.handleError(err, queryName, variables, runAnonymous);
    }

    return rval;
  }
}
