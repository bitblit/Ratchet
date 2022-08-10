import { LoggerLevelName } from './logger-level-name';

export class LoggerUtil {
  public static handlerFunctionMap(doNotUseConsoleDebug: boolean): Map<LoggerLevelName, (...any) => void> {
    const output: Map<LoggerLevelName, (...any) => void> = new Map<LoggerLevelName, (...any) => void>();
    output.set(LoggerLevelName.error, console.error);
    output.set(LoggerLevelName.warn, console.warn);
    output.set(LoggerLevelName.info, console.info);
    output.set(LoggerLevelName.verbose, doNotUseConsoleDebug ? console.log : console.debug);
    output.set(LoggerLevelName.debug, doNotUseConsoleDebug ? console.log : console.debug);
    output.set(LoggerLevelName.silly, doNotUseConsoleDebug ? console.log : console.debug);
    return output;
  }

  public static defaultHandlerFunction(): (...any) => void {
    return console.info;
  }

  public static levelIsEnabled(targetLevel: LoggerLevelName, currentEnabled: LoggerLevelName): boolean {
    return true; // TODO: impl
  }
}
