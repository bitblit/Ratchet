import { Logger } from '../../common/logger';
import { LoggerLevelName } from '../../common/logger-support/logger-level-name';
import { GraphqlRatchetErrorHandler } from './graphql-ratchet-error-handler';

export class DefaultGraphqlRatchetErrorHandler implements GraphqlRatchetErrorHandler {
  constructor(
    private logLevel: LoggerLevelName = LoggerLevelName.warn,
    private rethrow: boolean = false,
  ) {}

  public handleError(error: any, queryName: string, variables: Record<string, any>, anonymous: boolean): void {
    Logger.logByLevel(this.logLevel, 'Graphql failed : %s : %s : Anon-%s : %j', error, queryName, anonymous, variables);
    if (this.rethrow) {
      throw error;
    }
  }
}
