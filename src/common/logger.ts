import util from 'util';
import { LogMessage } from './log-message';
import { LogSnapshot } from './log-snapshot';
import { LoggerOptions } from './logger-options';
import { LoggerInstance } from './logger-instance';
import { getLogger } from 'barrelsby/bin/options/logger';

/**
 * Service to setup winston, and also adds ring buffer capability if so desired.
 * Also allows setting an adjustment for more precise timestamps (on the ring buffer)
 *
 *
 * Important note : This class is here to make logging SIMPLE - it does 2 things, logging to console
 * and storage in a ring buffer.  If you need to do something more complicated (like logging to files,
 * multiple transports, etc) you really should just use winston directly and skip this class entirely
 */
export enum LoggerLevelName {
  error = 'error',
  warn = 'warn',
  info = 'info',
  verbose = 'verbose',
  debug = 'debug',
  silly = 'silly',
}

export class Logger {
  private static LOGGER_INSTANCES: Map<string, LoggerInstance> = new Map<string, LoggerInstance>();

  public static readonly LEVEL_NAMES: string[] = [
    LoggerLevelName.error,
    LoggerLevelName.warn,
    LoggerLevelName.info,
    LoggerLevelName.verbose,
    LoggerLevelName.debug,
    LoggerLevelName.silly,
  ];
  private static readonly DEFAULT_LEVEL_COLORS: string[] = ['#F00', '#FF0', '#0F0', '#0EF', '#F0F', '#000'];

  public static dumpConfigurationIntoLog(): void {
    Logger.error('ERROR enabled');
    Logger.warn('WARN enabled');
    Logger.info('INFO enabled');
    Logger.verbose('VERBOSE enabled');
    Logger.debug('DEBUG enabled');
    Logger.silly('SILLY enabled');
  }

  public static defaultLoggerOptions(): LoggerOptions {
    const rval: LoggerOptions = {
      initialLevel: LoggerLevelName.info,
      levelColors: Logger.DEFAULT_LEVEL_COLORS,
    };
    return rval;
  }

  public static validateLoggerOptions(opts: LoggerOptions, doNotThrowException: boolean = false): string[] {
    const errs: string[] = [];
    if (!opts) {
      errs.push('May not be null');
    } else {
      if (!opts.initialLevel) {
        errs.push('Must set initial level');
      }
      if (!opts.levelColors || opts.levelColors.length !== 6) {
        errs.push('Must set level colors array of length 6');
      }
    }
    if (!doNotThrowException && errs.length > 0) {
      throw new Error('Invalid logger options : ' + JSON.stringify(errs));
    }
    return errs;
  }

  public static getLogger(loggerName: string = 'default', options: LoggerOptions = Logger.defaultLoggerOptions()): LoggerInstance {
    let inst: LoggerInstance = Logger.LOGGER_INSTANCES.get(loggerName);
    if (!inst) {
      Logger.validateLoggerOptions(options, false);
      inst = new LoggerInstance(loggerName, options);
      Logger.LOGGER_INSTANCES.set(loggerName, inst);
    }
    return inst;
  }

  // Classic passthru's direct to the default logger
  public static setUseConsoleLogForEverythingBelowInfo(newVal: boolean): void {
    return Logger.getLogger().setUseConsoleLogForEverythingBelowInfo(newVal);
  }

  public static setIncludeLevelInMessage(newVal: boolean): void {
    return Logger.getLogger().setIncludeLevelInMessage(newVal);
  }

  public static getRingBufferIdx(): number {
    return Logger.getLogger().getRingBufferIdx();
  }

  public static getRingBufferLastSnapshotIdx(): number {
    return Logger.getLogger().getRingBufferLastSnapshotIdx();
  }

  public static getLevel(): string {
    return Logger.getLogger().getLevel();
  }

  public static setLevelColorByName(levelName: string, newColor: string): void {
    return Logger.getLogger().setLevelColorByName(levelName, newColor);
  }

  public static setLevelByName(newLevel: string): void {
    return Logger.getLogger().setLevelByName(newLevel);
  }

  public static setLevelByNumber(newLevel: number): void {
    return Logger.getLogger().setLevelByNumber(newLevel);
  }

  public static isConsoleLoggingEnabled(): boolean {
    return Logger.getLogger().isConsoleLoggingEnabled();
  }

  public static setConsoleLoggingEnabled(newValue: boolean): void {
    return Logger.getLogger().setConsoleLoggingEnabled(newValue);
  }

  public static getTracePrefix(): string {
    return Logger.getLogger().getTracePrefix();
  }

  public static setTracePrefix(newValue: string): void {
    return Logger.getLogger().setTracePrefix(newValue);
  }

  public static updateTimeAdjustment(newValueInMs: number): void {
    return Logger.getLogger().updateTimeAdjustment(newValueInMs);
  }

  public static setRingBufferSize(newSize: number): void {
    return Logger.getLogger().setRingBufferSize(newSize);
  }

  public static levelNumber(name: string): number {
    return Logger.getLogger().levelNumber(name);
  }

  public static levelName(idx: number): string {
    return Logger.getLogger().levelName(idx);
  }

  public static levelColor(idx: number): string {
    return Logger.getLogger().levelColor(idx);
  }

  public static getMessages(inStartFrom: number = null, clear = false, reverseSort = false): LogMessage[] {
    return Logger.getLogger().getMessages(inStartFrom, clear, reverseSort);
  }

  public static consoleLogPassThru(level: number, callback: Function, ...input: any[]): void {
    return Logger.getLogger().consoleLogPassThru(level, callback, ...input);
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
    return Logger.getLogger().takeSnapshot();
  }

  public static logByLevel(level: string, format: string, ...input: any[]): void {
    return Logger.getLogger().logByLevel(level, format, ...input);
  }

  public static importMessages(msgs: LogMessage[], prefixIn = '', addTimestamp = true): void {
    return Logger.getLogger().importMessages(msgs, prefixIn, addTimestamp);
  }

  public static getLastLogMessage(): LogMessage {
    return Logger.getLogger().getLastLogMessage();
  }
}
