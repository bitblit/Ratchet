import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { FilterChainContext } from '../../config/http/filter-chain-context.js';
import { LoggerLevelName } from '@bitblit/ratchet-common/logger/logger-level-name';

/**
 * This only works because Node is single threaded...
 */
export class LogLevelManipulationFilter {
  private static LOG_LEVEL_BEFORE_CHANGE: LoggerLevelName = null;

  // TODO: Implement me!!
  public static async setLogLevelForTransaction(_fCtx: FilterChainContext): Promise<boolean> {
    LogLevelManipulationFilter.LOG_LEVEL_BEFORE_CHANGE = Logger.getLevel();
    // TODO: Set me too! Logger.setTracePrefix(null);
    return true;
  }

  public static async clearLogLevelForTransaction(_fCtx: FilterChainContext): Promise<boolean> {
    if (LogLevelManipulationFilter.LOG_LEVEL_BEFORE_CHANGE) {
      Logger.setLevel(LogLevelManipulationFilter.LOG_LEVEL_BEFORE_CHANGE);
      LogLevelManipulationFilter.LOG_LEVEL_BEFORE_CHANGE = null;
      Logger.updateTracePrefix(null);
    }
    return true;
  }
}
