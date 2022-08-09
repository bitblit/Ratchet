import util from 'util';
import { LogMessage } from './log-message';
import { LogSnapshot } from './log-snapshot';
import { Logger } from './logger';
import { LoggerOptions } from './logger-options';

export class LoggerInstance {
  private CONSOLE_LOGGING_ENABLED = true;
  private TRACE_PREFIX: string = null;

  private TIME_ADJUSTMENT_IN_MS = 0;
  private RING_BUFFER_SIZE = 0;
  private RING_BUFFER: LogMessage[] = [];
  private RING_BUFFER_IDX = 0;
  private RING_BUFFER_LAST_SNAPSHOT_IDX = 0;
  private LAST_LOG_MESSAGE: LogMessage = { msg: 'No message yet', timestamp: new Date().getTime(), lvl: 3 } as LogMessage;

  private LEVEL = 2; // INFO
  private INCLUDE_LEVEL_IN_MESSAGE: boolean = true;

  // Set this to true if you are worried about other developers not realizing they need to set the chrome filters
  // in the dev channel correctly.  You'll lose coloring, although all filtering will still work as expected
  private USE_CONSOLE_LOG_FOR_EVERYTHING_BELOW_INFO: boolean = false;

  constructor(private loggerName: string = 'default', private options: LoggerOptions = Logger.defaultLoggerOptions()) {}

  public dumpConfigurationIntoLog(): void {
    Logger.error('ERROR enabled');
    Logger.warn('WARN enabled');
    Logger.info('INFO enabled');
    Logger.verbose('VERBOSE enabled');
    Logger.debug('DEBUG enabled');
    Logger.silly('SILLY enabled');
  }

  public setUseConsoleLogForEverythingBelowInfo(newVal: boolean): void {
    this.USE_CONSOLE_LOG_FOR_EVERYTHING_BELOW_INFO = newVal;
  }

  public setIncludeLevelInMessage(newVal: boolean): void {
    this.INCLUDE_LEVEL_IN_MESSAGE = newVal;
  }

  public getRingBufferIdx(): number {
    return this.RING_BUFFER_IDX;
  }

  public getRingBufferLastSnapshotIdx(): number {
    return this.RING_BUFFER_LAST_SNAPSHOT_IDX;
  }

  public getLevel(): string {
    return this.levelName(this.LEVEL);
  }

  public setLevelColorByName(levelName: string, newColor: string): void {
    const idx: number = Logger.levelNumber(levelName);
    if (!levelName || !newColor) {
      throw Error('Cannot set color with null name or color');
    }
    if (idx != null) {
      this.options.levelColors[idx] = newColor;
    }
  }

  public setLevelByName(newLevel: string): void {
    const num: number = Logger.levelNumber(newLevel);
    if (num != null) {
      this.LEVEL = num;
    } else {
      Logger.error('Could not change level to %s - invalid name', newLevel);
    }
  }

  public setLevelByNumber(newLevel: number): void {
    if (newLevel >= 0 && newLevel < Logger.LEVEL_NAMES.length) {
      this.LEVEL = newLevel;
    } else {
      Logger.error('Could not change level to %s - invalid number', newLevel);
    }
  }

  public isConsoleLoggingEnabled(): boolean {
    return this.CONSOLE_LOGGING_ENABLED;
  }

  public setConsoleLoggingEnabled(newValue: boolean): void {
    this.CONSOLE_LOGGING_ENABLED = newValue;
  }

  public getTracePrefix(): string {
    return this.TRACE_PREFIX;
  }

  public setTracePrefix(newValue: string): void {
    this.TRACE_PREFIX = newValue;
  }

  public updateTimeAdjustment(newValueInMs: number): void {
    this.TIME_ADJUSTMENT_IN_MS = newValueInMs == null ? 0 : newValueInMs;
  }

  public setRingBufferSize(newSize: number): void {
    this.RING_BUFFER_SIZE = newSize == null ? 0 : newSize;
    this.clearRingBuffer();
  }

  public levelNumber(name: string): number {
    const num = Logger.LEVEL_NAMES.indexOf(name);
    return num == -1 ? null : num;
  }

  public levelName(idx: number): string {
    return idx != null && idx >= 0 && idx < Logger.LEVEL_NAMES.length ? Logger.LEVEL_NAMES[idx] : null;
  }

  public levelColor(idx: number): string {
    return idx != null && idx >= 0 && idx < this.options.levelColors.length ? this.options.levelColors[idx] : '#000';
  }

  public getMessages(inStartFrom: number = null, clear = false, reverseSort = false): LogMessage[] {
    let rval: LogMessage[] = null;
    if (this.RING_BUFFER_IDX < this.RING_BUFFER_SIZE) {
      const start: number = inStartFrom == null ? 0 : inStartFrom;
      rval = this.RING_BUFFER.slice(start, this.RING_BUFFER_IDX); // Use slice to get a copy (should use below too)
    } else {
      rval = [];

      const firstIdx = this.RING_BUFFER_IDX - this.RING_BUFFER_SIZE;
      const startFrom = inStartFrom ? Math.max(inStartFrom, firstIdx) : firstIdx;

      for (let i = startFrom; i < this.RING_BUFFER_IDX; i++) {
        rval.push(this.RING_BUFFER[i % this.RING_BUFFER_SIZE]);
      }
    }

    if (clear) {
      this.clearRingBuffer();
    }

    if (reverseSort) {
      rval = rval.reverse();
    }

    return rval;
  }

  public consoleLogPassThru(level: number, callback: Function, ...input: any[]): void {
    if (this.INCLUDE_LEVEL_IN_MESSAGE) {
      input.unshift(this.fullTracePrefix(level));
    }
    if (this.LEVEL >= level) {
      callback(...input);
    }
  }

  public error(format: string, ...input: any[]): string {
    let msg: string = util.format(format, ...input);
    msg = this.conditionallyApplyLevelAndPrefixToMessage(0, msg);
    if (this.LEVEL >= 0) {
      this.ifConsoleLoggingEnabled(console.error, msg);
      this.addToRingBuffer(msg, 'error');
    }
    return msg;
  }

  public errorP(...input: any[]): void {
    Logger.consoleLogPassThru(0, console.error, ...input);
  }

  public warn(format: string, ...input: any[]): string {
    let msg: string = util.format(format, ...input);
    msg = this.conditionallyApplyLevelAndPrefixToMessage(1, msg);
    if (this.LEVEL >= 1) {
      this.ifConsoleLoggingEnabled(console.warn, msg);
      this.addToRingBuffer(msg, 'warn');
    }
    return msg;
  }

  public warnP(...input: any[]): void {
    Logger.consoleLogPassThru(1, console.warn, ...input);
  }

  public info(format: string, ...input: any[]): string {
    let msg: string = util.format(format, ...input);
    msg = this.conditionallyApplyLevelAndPrefixToMessage(2, msg);
    if (this.LEVEL >= 2) {
      this.ifConsoleLoggingEnabled(console.info, msg);
      this.addToRingBuffer(msg, 'info');
    }
    return msg;
  }

  public infoP(...input: any[]): void {
    Logger.consoleLogPassThru(2, console.info, ...input);
  }

  public verbose(format: string, ...input: any[]): string {
    let msg: string = util.format(format, ...input);
    msg = this.conditionallyApplyLevelAndPrefixToMessage(3, msg);
    if (this.LEVEL >= 3) {
      this.ifConsoleLoggingEnabled(console.info, msg);
      this.addToRingBuffer(msg, 'verbose');
    }
    return msg;
  }

  public verboseP(...input: any[]): void {
    Logger.consoleLogPassThru(3, console.info, ...input);
  }

  public debug(format: string, ...input: any[]): string {
    let msg: string = util.format(format, ...input);
    msg = this.conditionallyApplyLevelAndPrefixToMessage(4, msg);
    if (this.LEVEL >= 4) {
      // This is here because old versions of Node do not support console.debug
      if (console.debug && !this.USE_CONSOLE_LOG_FOR_EVERYTHING_BELOW_INFO) {
        this.ifConsoleLoggingEnabled(console.debug, msg);
      } else {
        this.ifConsoleLoggingEnabled(console.log, msg);
      }

      this.addToRingBuffer(msg, 'debug');
    }
    return msg;
  }

  public debugP(...input: any[]): void {
    // This is here because old versions of Node do not support console.debug
    const fn: Function = !console.debug || this.USE_CONSOLE_LOG_FOR_EVERYTHING_BELOW_INFO ? console.log : console.debug;
    Logger.consoleLogPassThru(4, fn, ...input);
  }

  public silly(format: string, ...input: any[]): string {
    let msg: string = util.format(format, ...input);
    msg = this.conditionallyApplyLevelAndPrefixToMessage(5, msg);
    if (this.LEVEL >= 5) {
      this.ifConsoleLoggingEnabled(console.log, msg);
      this.addToRingBuffer(msg, 'silly');
    }
    return msg;
  }

  public sillyP(...input: any[]): void {
    Logger.consoleLogPassThru(5, console.log, ...input);
  }

  public takeSnapshot(): LogSnapshot {
    const trailingEdge = Math.max(0, this.RING_BUFFER_IDX - this.RING_BUFFER_SIZE);
    const rval: LogSnapshot = {
      messages: Logger.getMessages(this.RING_BUFFER_LAST_SNAPSHOT_IDX),
      logMessagesTruncated: Math.max(0, trailingEdge - this.RING_BUFFER_LAST_SNAPSHOT_IDX),
    } as LogSnapshot;

    this.RING_BUFFER_LAST_SNAPSHOT_IDX = this.RING_BUFFER_IDX;
    return rval;
  }

  public logByLevel(level: string, format: string, ...input: any[]): void {
    const num: number = Logger.levelNumber(level);
    if (num != null) {
      const msg: string = util.format(format, ...input);
      switch (num) {
        case 0:
          Logger.error(msg);
          break;
        case 1:
          Logger.warn(msg);
          break;
        case 2:
          Logger.info(msg);
          break;
        case 3:
          Logger.verbose(msg);
          break;
        case 4:
          Logger.debug(msg);
          break;
        case 5:
          Logger.silly(msg);
          break;
        default:
          console.log('Cant happen, level was ' + num);
          break;
      }
    } else {
      Logger.error('Cannot log at level %s - invalid level', level);
    }
  }

  public importMessages(msgs: LogMessage[], prefixIn = '', addTimestamp = true): void {
    const prefix: string = prefixIn || '';
    if (msgs && msgs.length > 0) {
      Logger.silly('Received monitor data : %d msgs', msgs.length);

      // Pump messages
      msgs.forEach((m) => {
        if (m.msg) {
          let mOut: string = prefix;
          if (addTimestamp) {
            const ts: string = String(new Date()).substring(15, 24);
            mOut += ' (' + ts + ') : ';
            mOut += m.msg;
          }
          Logger.logByLevel(Logger.levelName(m.lvl), mOut);
        }
      });
    }
  }

  public getLastLogMessage(): LogMessage {
    return Object.assign({}, this.LAST_LOG_MESSAGE) as LogMessage;
  }

  private clearRingBuffer() {
    this.RING_BUFFER = [];
    this.RING_BUFFER_IDX = 0;
    this.RING_BUFFER_LAST_SNAPSHOT_IDX = 0;
    Logger.info('Cleared ring buffer (size is now %d)', this.RING_BUFFER_SIZE);
  }

  private addToRingBuffer(message: string, level: string): void {
    const levNum = Logger.levelNumber(level);
    const newMsg: LogMessage = {
      msg: message,
      lvl: levNum,
      timestamp: new Date().getTime() + this.TIME_ADJUSTMENT_IN_MS,
    } as LogMessage;

    this.LAST_LOG_MESSAGE = newMsg;

    if (this.RING_BUFFER_SIZE > 0) {
      if (levNum != null && levNum <= this.LEVEL) {
        this.RING_BUFFER[this.RING_BUFFER_IDX % this.RING_BUFFER_SIZE] = newMsg;
        this.RING_BUFFER_IDX++; // advance
      }
    }
  }

  private conditionallyApplyLevelAndPrefixToMessage(lvl: number, msg: string): string {
    return this.fullTracePrefix(lvl) + msg;
  }

  private fullTracePrefix(lvl: number): string {
    const tmp: string = this.TRACE_PREFIX ? this.TRACE_PREFIX : '';
    return this.INCLUDE_LEVEL_IN_MESSAGE ? '[' + this.levelName(lvl) + '] ' + tmp : tmp;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  private ifConsoleLoggingEnabled(callback: Function, ...message: any[]): void {
    if (this.CONSOLE_LOGGING_ENABLED) {
      callback(...message);
    }
  }
}
