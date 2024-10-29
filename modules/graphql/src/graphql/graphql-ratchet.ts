import { GraphqlRatchetEndpointProvider } from "./provider/graphql-ratchet-endpoint-provider.js";
import { GraphqlRatchetJwtTokenProvider } from "./provider/graphql-ratchet-jwt-token-provider.js";
import { GraphqlRatchetQueryProvider } from "./provider/graphql-ratchet-query-provider.js";
import { GraphqlRatchetErrorHandler } from "./provider/graphql-ratchet-error-handler.js";
import { DefaultGraphqlRatchetErrorHandler } from "./provider/default-graphql-ratchet-error-handler.js";

import { RequireRatchet } from "@bitblit/ratchet-common/lang/require-ratchet";
import { Logger } from "@bitblit/ratchet-common/logger/logger";
import { ErrorRatchet } from "@bitblit/ratchet-common/lang/error-ratchet";
import { StringRatchet } from "@bitblit/ratchet-common/lang/string-ratchet";
import { GraphQLClient } from "graphql-request";
import { AuthorizationStyle } from "./authorization-style";

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

  public currentAuthToken(): string {
    return this?.jwtTokenProvider?.fetchJwtToken();
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

  private fetchApi(authStyle: AuthorizationStyle): GraphQLClient {
    let rval: GraphQLClient = null;
    const jwtToken: string = authStyle===AuthorizationStyle.AlwaysAnonymous ? null : StringRatchet.trimToNull(this?.jwtTokenProvider?.fetchJwtToken());
    if (authStyle===AuthorizationStyle.TokenRequired && !jwtToken) {
      throw ErrorRatchet.fErr('No token provided, auth style is TokenRequired');
    }

    this.checkIfEndpointChanged(); // Always check for cache invalidation first...
    Logger.info('Fetch auth client %s', StringRatchet.obscure(StringRatchet.trimToEmpty(jwtToken), 2, 2));

    if (jwtToken) {
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
      if (!this.noAuthClient) {
        this.noAuthClient = this.createAnonymousApi();
      } else {
        Logger.debug('Fetching anonymous client from cache');
      }
      rval = this.noAuthClient;
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

  public static extractSingleValueFromResponse<T>(data: any): T {
    if (!data) {
      throw ErrorRatchet.fErr('Could not find response in : %j', data);
    }
    const keys: string[] = Object.keys(data);
    if (keys.length !== 1) {
      ErrorRatchet.throwFormattedErr('Unexpected number of keys : %s : %j', keys.length, keys);
    }
    const rval: T = data[keys[0]];
    return rval;
  }

  public async executeQuery<T>(queryName: string, variables: Record<string, any>, authStyle: AuthorizationStyle = AuthorizationStyle.TokenRequired): Promise<T> {
    let rval: T = null;
    try {
      const api: GraphQLClient = this.fetchApi(authStyle);
      if (api) {
        Logger.debug('API fetched for %s, fetching gql', queryName);
        const gql: string = await this.fetchQueryText(queryName);
        Logger.debug('API and GQL fetched for %s - running %s %s', queryName, gql, api);
        const newValues: any = await api.request(gql, variables);
        if (newValues['errors']) {
          // Convert graphql errors into errors
          this.errorHandler.handleError(newValues['errors'],queryName, variables, authStyle);
        }
        rval = GraphqlRatchet.extractSingleValueFromResponse(newValues);
        Logger.silly('Query returned: %j', rval);
      } else {
        ErrorRatchet.throwFormattedErr('Cannot run - no api fetched');
      }
    } catch (err) {
      Logger.silly('Exception caught in executeQuery : %s %s %j %s', err, queryName, variables, authStyle, err);
      this.errorHandler.handleError(err, queryName, variables, authStyle);
    }
    return rval;
  }

  public async executeMutate<T>(queryName: string, variables: any, authStyle: AuthorizationStyle = AuthorizationStyle.TokenRequired): Promise<T> {
    Logger.info('Mutate : %s : %j', queryName, variables);
    let rval: T = null;
    const api: GraphQLClient = this.fetchApi(authStyle);
    try {
      if (api) {
        const gql: string = await this.fetchQueryText(queryName);
        Logger.debug('API and GQL fetched for %s - running %s %s', queryName, gql, api);
        const newValues: any = await api.request(gql, variables);
        if (newValues['errors']) {
          // Convert graphql errors into errors
          this.errorHandler.handleError(newValues['errors'],queryName, variables, authStyle);
        }
        rval = GraphqlRatchet.extractSingleValueFromResponse(newValues);
        Logger.silly('Mutate returned: %j', rval);
      } else {
        ErrorRatchet.throwFormattedErr('Cannot run - no api fetched');
      }
    } catch (err) {
      this.errorHandler.handleError(err, queryName, variables, authStyle);
    }

    return rval;
  }
}
