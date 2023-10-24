import { LogMessage } from './logger-support/log-message';
import { LogSnapshot } from './logger-support/log-snapshot';
import { LoggerOptions } from './logger-support/logger-options';
import { LoggerInstance } from './logger-support/logger-instance';
import { LogMessageFormatType } from './logger-support/log-message-format-type';
import { LoggerLevelName } from './logger-support/logger-level-name';
import { LoggerRingBuffer } from './logger-support/logger-ring-buffer';
import { LogMessageBuilder } from './logger-support/log-message-builder';
import { LoggerOutputFunction } from './logger-support/logger-output-function';

/**
 * Class to simplify logging across both browsers and node (especially lambda)
 *
 * Important note : This class is here to make logging SIMPLE - mainly it is focused on simplicity,
 * and single point of enable/disable logging. Output goes to console, since thats the only thing
 * that is present in both the browser and node.  If you need to do something more complicated (like
 * logging to files,  multiple transports, etc) you really should just use something heavier like
 * Winston directly and skip this class entirely
 */

export class Logger {
  private static LOGGER_INSTANCE_MAP_GLOBAL_KEY: string = 'RatchetGlobalLoggerMap';
  private static GLOBAL_PROVIDER: Record<string, any> = process || global || window;
  //private static LOGGER_INSTANCES: Map<string, LoggerInstance> = new Map<string, LoggerInstance>();
  private static DEFAULT_OPTIONS: LoggerOptions = {
    initialLevel: LoggerLevelName.info,
    formatType: LogMessageFormatType.ClassicSingleLine,
    trace: null,
    globalVars: {},
    outputFunction: LoggerOutputFunction.Console,
    ringBufferSize: 0,
    preProcessors: [],
  };

  public static applyDefaultsToOptions(input?: LoggerOptions): LoggerOptions {
    const rval: LoggerOptions = input || {};
    rval.initialLevel = rval.initialLevel ?? Logger.DEFAULT_OPTIONS.initialLevel;
    rval.formatType = rval.formatType ?? Logger.DEFAULT_OPTIONS.formatType;
    rval.trace = rval.trace ?? Logger.DEFAULT_OPTIONS.trace;
    rval.globalVars = rval.globalVars ?? Logger.DEFAULT_OPTIONS.globalVars;
    rval.outputFunction = rval.outputFunction ?? Logger.DEFAULT_OPTIONS.outputFunction;
    rval.ringBufferSize = rval.ringBufferSize ?? Logger.DEFAULT_OPTIONS.ringBufferSize;

    return rval;
  }

  private static loggerInstances(): Map<string, LoggerInstance> {
    if (!Logger.GLOBAL_PROVIDER) {
      throw new Error('Cannot create logger - could not find a global provider');
    }
    let rval: Map<string, LoggerInstance> = Logger.GLOBAL_PROVIDER[Logger.LOGGER_INSTANCE_MAP_GLOBAL_KEY];
    if (!rval) {
      rval = new Map<string, LoggerInstance>();
      Logger.GLOBAL_PROVIDER[Logger.LOGGER_INSTANCE_MAP_GLOBAL_KEY] = rval;
    }
    return rval;
  }

  public static changeDefaultOptions(input: LoggerOptions, retroactive?: boolean): void {
    if (!input || !input.initialLevel || !input.formatType) {
      throw new Error('Default options must be non-null, and provide initial level and format type');
    }
    Logger.DEFAULT_OPTIONS = Object.assign({}, input);

    if (retroactive) {
      Array.from(Logger.loggerInstances().values()).forEach((li) => (li.options = input));
    }
  }

  public static getLogger(loggerName: string = 'default', inOptions?: LoggerOptions): LoggerInstance {
    let inst: LoggerInstance = Logger.loggerInstances().get(loggerName);
    if (!inst) {
      const options: LoggerOptions = Logger.applyDefaultsToOptions(inOptions);
      inst = new LoggerInstance(loggerName, options);
      Logger.loggerInstances().set(loggerName, inst);
    }
    return inst;
  }

  // Classic passthru's direct to the default logger

  public static recordMessageBuilder(msgBuild: LogMessageBuilder): string {
    return Logger.getLogger().recordMessageBuilder(msgBuild);
  }

  public static recordMessage(msg: LogMessage): string {
    return Logger.getLogger().recordMessage(msg);
  }

  public static formatMessages(msgs: LogMessage[]): string[] {
    return Logger.getLogger().formatMessages(msgs);
  }

  public static updateTracePrefix(newValue: string): void {
    return Logger.getLogger().updateTracePrefix(newValue);
  }

  public static changeRingBufferSize(newValue: number): void {
    return Logger.getLogger().changeRingBufferSize(newValue);
  }

  public static getRingBuffer(): LoggerRingBuffer {
    return Logger.getLogger().ringBuffer;
  }

  public static dumpConfigurationIntoLog(): void {
    return Logger.getLogger().dumpConfigurationIntoLog();
  }

  public static dumpOptionsIntoLog(): void {
    return Logger.getLogger().dumpOptionsIntoLog();
  }

  public static getLevel(): LoggerLevelName {
    return Logger.getLogger().level;
  }

  public static setLevel(newLevel: LoggerLevelName): void {
    Logger.getLogger().level = newLevel;
  }

  public static getOptions(): LoggerOptions {
    return Logger.getLogger().options;
  }

  public static getMessages(inStartFrom: number = null, clear = false, reverseSort = false): LogMessage[] {
    const buf: LoggerRingBuffer = Logger.getLogger().ringBuffer;
    return buf ? buf.getMessages(inStartFrom, clear, reverseSort) : null;
  }

  public static consoleLogPassThru(level: LoggerLevelName, ...input: any[]): void {
    return Logger.getLogger().consoleLogPassThru(level, ...input);
  }

  public static error(format: string, ...input: any[]): string {
    return Logger.getLogger().error(format, ...input);
  }

  public static errorP(...input: any[]): void {
    return Logger.getLogger().errorP(...input);
  }

  public static warn(format: string, ...input: any[]): string {
    return Logger.getLogger().warn(format, ...input);
  }

  public static warnP(...input: any[]): void {
    return Logger.getLogger().warnP(...input);
  }

  public static info(format: string, ...input: any[]): string {
    return Logger.getLogger().info(format, ...input);
  }

  public static infoP(...input: any[]): void {
    return Logger.getLogger().infoP(...input);
  }

  public static verbose(format: string, ...input: any[]): string {
    return Logger.getLogger().verbose(format, ...input);
  }

  public static verboseP(...input: any[]): void {
    return Logger.getLogger().verboseP(...input);
  }

  public static debug(format: string, ...input: any[]): string {
    return Logger.getLogger().debug(format, ...input);
  }

  public static debugP(...input: any[]): void {
    return Logger.getLogger().debugP(...input);
  }

  public static silly(format: string, ...input: any[]): string {
    return Logger.getLogger().silly(format, ...input);
  }

  public static sillyP(...input: any[]): void {
    return Logger.getLogger().sillyP(...input);
  }

  public static takeSnapshot(): LogSnapshot {
    const buf: LoggerRingBuffer = Logger.getLogger().ringBuffer;
    return buf ? buf.takeSnapshot() : null;
  }

  public static logByLevel(level: LoggerLevelName, format: string, ...input: any[]): void {
    return Logger.getLogger().logByLevel(level, format, ...input);
  }

  public static importMessages(msgs: LogMessage[], prefixIn = '', addTimestamp = true): void {
    return Logger.getLogger().importMessages(msgs, prefixIn, addTimestamp);
  }

  public static getLastLogMessage(): LogMessage {
    const buf: LoggerRingBuffer = Logger.getLogger().ringBuffer;
    return buf ? buf.getLastLogMessage() : null;
  }
}
