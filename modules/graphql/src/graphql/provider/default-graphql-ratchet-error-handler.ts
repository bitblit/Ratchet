import { GraphqlRatchetErrorHandler } from './graphql-ratchet-error-handler.js';
import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { LoggerLevelName } from '@bitblit/ratchet-common/logger/logger-level-name';
import { AuthorizationStyle } from '../authorization-style';

export class DefaultGraphqlRatchetErrorHandler implements GraphqlRatchetErrorHandler {
  constructor(
    private logLevel: LoggerLevelName = LoggerLevelName.warn,
    private rethrow: boolean = false,
  ) {}

  public handleError(error: any, queryName: string, variables: Record<string, any>, authStyle: AuthorizationStyle): void {
    Logger.logByLevel(this.logLevel, 'Graphql failed : %s : %s : Anon-%s : %j', error, queryName, authStyle, variables);
    if (this.rethrow) {
      throw error;
    }
  }
}
