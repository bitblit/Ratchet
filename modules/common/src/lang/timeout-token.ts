import { Logger } from '../logger/logger.js';
import { LoggerLevelName } from '../logger/logger-level-name.js';

export class TimeoutToken {
  private __timeoutTokenFlagField = true;

  constructor(
    private title: string,
    private timeoutMS: number,
  ) {
    Object.setPrototypeOf(this, TimeoutToken.prototype);
  }

  public writeToLog(logLevel: LoggerLevelName = LoggerLevelName.warn): void {
    Logger.logByLevel(logLevel, 'Timed out after %d ms waiting for results of %s', this.timeoutMS, this.title);
  }

   
  public static isTimeoutToken(value: any): boolean {
    return !!value && !!value['__timeoutTokenFlagField'];
  }
}
