import { Injectable } from "@angular/core";
import { Logger } from "@bitblit/ratchet-common/logger/logger";
import { GraphqlRatchet } from "@bitblit/ratchet-graphql/graphql/graphql-ratchet";
import { AuthorizationStyle } from "@bitblit/ratchet-graphql/graphql/authorization-style";
import { ErrorHandlingApproach } from "@bitblit/ratchet-common/lang/error-handling-approach";
import { ErrorRatchet } from "@bitblit/ratchet-common/lang/error-ratchet";
import { LoggerLevelName } from "@bitblit/ratchet-common/logger/logger-level-name";
import { ProcessMonitorService } from "./process-monitor/process-monitor-service";
import { GraphqlQueryExecutionOptions } from "./graphql-query-execution-options";
import { GraphqlQueryExecutionDisplayStyle } from "./graphql-query-execution-display-style";
import { StringRatchet } from "@bitblit/ratchet-common/lang/string-ratchet";

@Injectable({ providedIn: 'root' })
export class GraphqlQueryService {
  constructor(
    private graphqlRatchet: GraphqlRatchet,
    private processMonitorService: ProcessMonitorService
  ) {}

  public fullOptions(input?: Partial<GraphqlQueryExecutionOptions>): GraphqlQueryExecutionOptions {
    const rval: GraphqlQueryExecutionOptions = Object.assign({
      blockMessage: null,
      authStyle: AuthorizationStyle.TokenRequired,
      errorHandling: ErrorHandlingApproach.LogAndPassThru,
      displayStyle: GraphqlQueryExecutionDisplayStyle.Monitored
    },input??{});

    if (StringRatchet.trimToNull(rval.blockMessage) && rval.displayStyle!==GraphqlQueryExecutionDisplayStyle.Modal) {
      throw ErrorRatchet.fErr('Block message specified but display style is not modal');
    }
    return rval;
  }

  public async executeQuery<T>(
    queryName: string,
    variables: any,
    inOptions?: Partial<GraphqlQueryExecutionOptions>
  ): Promise<T | null> {
    let rval: T | null = null;
    Logger.debug('eq: %j -: %s --: %s ---: %j', queryName, variables);
    const opts: GraphqlQueryExecutionOptions = this.fullOptions(inOptions);

    try {
      switch (opts.displayStyle) {
        case GraphqlQueryExecutionDisplayStyle.Silent: rval = await this.graphqlRatchet.executeQuery<T>(queryName, variables, opts.authStyle);break;
        case GraphqlQueryExecutionDisplayStyle.Monitored: rval = await this.processMonitorService.monitorProcessSimple(this.graphqlRatchet.executeQuery<T>(queryName, variables, opts.authStyle), 'Running query', false);break;
        case GraphqlQueryExecutionDisplayStyle.Modal: rval = await this.processMonitorService.monitorProcessSimple(
            this.graphqlRatchet.executeQuery<T>(queryName, variables, opts.authStyle),
            opts.blockMessage ?? 'Running query...',true); break;
        default:
          throw ErrorRatchet.fErr('Cannot happen - no such display style as %s', opts.displayStyle);
      }
    } catch (err) {
      ErrorRatchet.handleErrorByApproach(err, opts.errorHandling, LoggerLevelName.error, 'GraphQL Error : %s');
    }

    return rval;
  }

  public async executeMutate<T>(
    queryName: string,
    variables: any,
    inOptions?: Partial<GraphqlQueryExecutionOptions>
  ): Promise<T | null> {
    let rval: T | null = null;
    const opts: GraphqlQueryExecutionOptions = this.fullOptions(inOptions);
    Logger.debug('em: %j -: %s --: %s ---: %j', queryName, variables);
    try {

      switch (opts.displayStyle) {
        case GraphqlQueryExecutionDisplayStyle.Silent: rval = await this.graphqlRatchet.executeMutate<T>(queryName, variables, opts.authStyle);break;
        case GraphqlQueryExecutionDisplayStyle.Monitored: rval = await this.processMonitorService.monitorProcessSimple(this.graphqlRatchet.executeMutate<T>(queryName, variables, opts.authStyle), 'Running query', false);break;
        case GraphqlQueryExecutionDisplayStyle.Modal: rval = await this.processMonitorService.monitorProcessSimple(
          this.graphqlRatchet.executeMutate<T>(queryName, variables, opts.authStyle),
          opts.blockMessage ?? 'Running change...',true); break;
        default:
          throw ErrorRatchet.fErr('Cannot happen - no such display style as %s', opts.displayStyle);
      }
    } catch (err) {
      ErrorRatchet.handleErrorByApproach(err, opts.errorHandling, LoggerLevelName.error, 'GraphQL Error : %s');
    }
    return rval;
  }

}
