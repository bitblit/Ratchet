import { LoggerLevelName } from './logger-level-name.js';
import { LoggerOutputFunction } from './logger-output-function.js';

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
      // Have to do this because process.stdout.write refers to 'this'
      // See: https://github.com/nodejs/node-v0.x-archive/issues/7980
      const myStdOut: (...any) => void = (chunk, cb) => process.stdout.write(chunk, 'utf-8', cb);
      output.set(LoggerLevelName.error, myStdOut);
      output.set(LoggerLevelName.warn, myStdOut);
      output.set(LoggerLevelName.info, myStdOut);
      output.set(LoggerLevelName.verbose, myStdOut);
      output.set(LoggerLevelName.debug, myStdOut);
      output.set(LoggerLevelName.silly, myStdOut);
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
