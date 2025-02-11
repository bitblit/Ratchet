import { Injectable } from "@angular/core";
import { Logger } from "@bitblit/ratchet-common/logger/logger";
import { GraphqlRatchet } from "@bitblit/ratchet-graphql/graphql/graphql-ratchet";
import { AuthorizationStyle } from "@bitblit/ratchet-graphql/graphql/authorization-style";
import { ErrorHandlingApproach } from "@bitblit/ratchet-common/lang/error-handling-approach";
import { ErrorRatchet } from "@bitblit/ratchet-common/lang/error-ratchet";
import { LoggerLevelName } from "@bitblit/ratchet-common/logger/logger-level-name";
import { ProcessMonitorService } from "./process-monitor/process-monitor-service";

@Injectable({ providedIn: 'root' })
export class GraphqlQueryService {
  constructor(
    private graphqlRatchet: GraphqlRatchet,
    private processMonitorService: ProcessMonitorService
  ) {}

  public async executeQuery<T>(
    queryName: string,
    variables: any,
    authStyle: AuthorizationStyle = AuthorizationStyle.TokenRequired,
    errorHandling: ErrorHandlingApproach = ErrorHandlingApproach.LogAndPassThru,
  ): Promise<T | null> {
    let rval: T | null = null;
    Logger.debug('eq: %j -: %s --: %s ---: %j', queryName, variables);

    try {
      rval = await
        this.processMonitorService.monitorProcessSimple(this.graphqlRatchet.executeQuery<T>(queryName, variables, authStyle), 'Running query', false);
    } catch (err) {
      ErrorRatchet.handleErrorByApproach(err, errorHandling, LoggerLevelName.error, 'GraphQL Error : %s');
    }

    return rval;
  }

  public async executeQueryWithBlock<T>(
    blockMessage: string,
    queryName: string,
    variables: any,
    authStyle: AuthorizationStyle = AuthorizationStyle.TokenRequired,
    errorHandling: ErrorHandlingApproach = ErrorHandlingApproach.LogAndPassThru,
  ): Promise<T | null> {
    let rval: T | null = null;
    Logger.debug('eqb: %j -: %s --: %s ---: %j', blockMessage, queryName, variables);

    try {
      rval = await
        this.processMonitorService.monitorProcessSimple(
        this.graphqlRatchet.executeQuery<T>(queryName, variables, authStyle),
        blockMessage,true);
    } catch (err) {
      ErrorRatchet.handleErrorByApproach(err, errorHandling, LoggerLevelName.error, 'GraphQL Error : %s');
    }

    return rval;
  }

  public async executeMutate<T>(
    queryName: string,
    variables: any,
    authStyle: AuthorizationStyle = AuthorizationStyle.TokenRequired,
    errorHandling: ErrorHandlingApproach = ErrorHandlingApproach.LogAndPassThru,
  ): Promise<T | null> {
    let rval: T | null = null;
    Logger.debug('em: %j -: %s --: %s ---: %j', queryName, variables);
    try {
      rval = await
      this.processMonitorService.monitorProcessSimple(
        this.graphqlRatchet.executeMutate<T>(queryName, variables, authStyle), 'Running change', false);
    } catch (err) {
      ErrorRatchet.handleErrorByApproach(err, errorHandling, LoggerLevelName.error, 'GraphQL Error : %s');
    }
    return rval;
  }

  public async executeMutateWithBlock<T>(
    blockMessage: string,
    queryName: string,
    variables: any,
    authStyle: AuthorizationStyle = AuthorizationStyle.TokenRequired,
    errorHandling: ErrorHandlingApproach = ErrorHandlingApproach.LogAndPassThru,
  ): Promise<T | null> {
    let rval: T | null = null;

    Logger.debug('emb: %j -: %s --: %s ---: %j', queryName, variables);
    try {
      rval = await this.processMonitorService.monitorProcessSimple(
        this.graphqlRatchet.executeMutate<T>(queryName, variables, authStyle),
        blockMessage, true);
    } catch (err) {
      ErrorRatchet.handleErrorByApproach(err, errorHandling, LoggerLevelName.error, 'GraphQL Error : %s');
    }

    return rval;
  }
}
