import { LogMessage } from './logger-support/log-message';
import { LogSnapshot } from './logger-support/log-snapshot';
import { LoggerOptions } from './logger-support/logger-options';
import { LoggerInstance } from './logger-support/logger-instance';
import { LogMessageFormatType } from './logger-support/log-message-format-type';
import { LoggerLevelName } from './logger-support/logger-level-name';
import { LoggerRingBuffer } from './logger-support/logger-ring-buffer';

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
  private static LOGGER_INSTANCES: Map<string, LoggerInstance> = new Map<string, LoggerInstance>();

  public static applyDefaults(input?: LoggerOptions): LoggerOptions {
    const rval: LoggerOptions = input || {};
    rval.initialLevel = rval.initialLevel || LoggerLevelName.info;
    rval.formatType = rval.formatType || LogMessageFormatType.ClassicSingleLine;
    rval.trace = rval.trace || null;
    rval.globalVars = rval.globalVars || {};
    rval.doNotUseConsoleDebug = rval.doNotUseConsoleDebug || false;
    rval.ringBufferSize = rval.ringBufferSize || 0;

    return rval;
  }

  public static getLogger(loggerName: string = 'default', inOptions?: LoggerOptions): LoggerInstance {
    let inst: LoggerInstance = Logger.LOGGER_INSTANCES.get(loggerName);
    if (!inst) {
      const options: LoggerOptions = Logger.applyDefaults(inOptions);
      inst = new LoggerInstance(loggerName, options);
      Logger.LOGGER_INSTANCES.set(loggerName, inst);
    }
    return inst;
  }

  // Classic passthru's direct to the default logger
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
