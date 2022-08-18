import { LoggerLevelName } from './logger-level-name';
import { LoggerOutputFunction } from './logger-output-function';

export class LoggerUtil {
  private static LOG_LEVELS_IN_ORDER: LoggerLevelName[] = [
    LoggerLevelName.error,
    LoggerLevelName.warn,
    LoggerLevelName.info,
    LoggerLevelName.verbose,
    LoggerLevelName.debug,
    LoggerLevelName.silly,
  ];

  public static handlerFunctionMap(outputFn: LoggerOutputFunction = LoggerOutputFunction.Console): Map<LoggerLevelName, (...any) => void> {
    const output: Map<LoggerLevelName, (...any) => void> = new Map<LoggerLevelName, (...any) => void>();
    if (outputFn === LoggerOutputFunction.StdOut) {
      if (!process?.stdout?.write) {
        throw new Error('Cannot use standard out - process.stdout.write not found');
      }
      output.set(LoggerLevelName.error, process.stdout.write);
      output.set(LoggerLevelName.warn, process.stdout.write);
      output.set(LoggerLevelName.info, process.stdout.write);
      output.set(LoggerLevelName.verbose, process.stdout.write);
      output.set(LoggerLevelName.debug, process.stdout.write);
      output.set(LoggerLevelName.silly, process.stdout.write);
    } else {
      output.set(LoggerLevelName.error, console.error);
      output.set(LoggerLevelName.warn, console.warn);
      output.set(LoggerLevelName.info, console.info);
      output.set(LoggerLevelName.verbose, outputFn === LoggerOutputFunction.ConsoleNoDebug ? console.log : console.debug);
      output.set(LoggerLevelName.debug, outputFn === LoggerOutputFunction.ConsoleNoDebug ? console.log : console.debug);
      output.set(LoggerLevelName.silly, outputFn === LoggerOutputFunction.ConsoleNoDebug ? console.log : console.debug);
    }
    return output;
  }

  public static defaultHandlerFunction(): (...any) => void {
    return console.info;
  }

  public static levelIsEnabled(targetLevel: LoggerLevelName, currentEnabled: LoggerLevelName): boolean {
    const idxTarget: number = LoggerUtil.LOG_LEVELS_IN_ORDER.indexOf(targetLevel);
    const lvl: number = LoggerUtil.LOG_LEVELS_IN_ORDER.indexOf(currentEnabled);
    return idxTarget > -1 && lvl > -1 && lvl >= idxTarget;
  }
}
