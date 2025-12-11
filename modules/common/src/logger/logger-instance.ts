import { LogMessage } from './log-message.js';
import { LoggerOptions } from './logger-options.js';
import { LoggerRingBuffer } from './logger-ring-buffer.js';
import { LoggerLevelName } from './logger-level-name.js';
import { LoggerUtil } from './logger-util.js';
import { LogMessageFormatter } from './log-message-formatter.js';
import { LogMessageFormatType } from './log-message-format-type.js';
import { ClassicSingleLineLogMessageFormatter } from './classic-single-line-log-message-formatter.js';
import { NoneLogMessageFormatter } from './none-log-message-formatter.js';
import { StructuredJsonLogMessageFormatter } from './structured-json-log-message-formatter.js';
import { LogMessageBuilder } from './log-message-builder.js';
import { LogMessageProcessor } from './log-message-processor.js';
import { StringRatchet } from '../lang/string-ratchet.js';
import { LoggerMeta } from './logger-meta.js';
import { SingleLineNoLevelLogMessageFormatter } from './single-line-no-level-log-message-formatter.js';

export class LoggerInstance {
  private _guid: number = Math.floor(Math.random() * 1_000_000);
  private _loggerMeta: LoggerMeta;

  private _ringBuffer: LoggerRingBuffer;
  private _formatter: LogMessageFormatter;
  private _level: LoggerLevelName;
  private _handlerFunctionMap: Map<LoggerLevelName, (...any) => void>;
  private _options: LoggerOptions;

  constructor(
    private loggerInstanceName = 'default',
    inOptions: LoggerOptions,
  ) {
    this.options = inOptions; // MUST use the setter here
  }


  public findMessagesMatchingInBuffer(regex: RegExp): LogMessage[] {
    if (this._ringBuffer) {
      throw new Error('Called findMessagesMatchingInBuffer with no ring buffer configured')
    }
    return this._ringBuffer.findMessagesMatchingInBuffer(regex);
  }

  public hasMessageMatchingInBuffer(regex: RegExp): boolean {
    return this.findMessagesMatchingInBuffer(regex).length>0;
  }


  public levelIsEnabled(level: LoggerLevelName): boolean {
    return LoggerUtil.levelIsEnabled(level, this._level);
  }

  public addPreProcessor(proc: LogMessageProcessor): LogMessageProcessor[] {
    if (proc) {
      this._options.preProcessors = this._options.preProcessors || [];
      this._options.preProcessors.push(proc);
    }
    return Object.assign([], this._options.preProcessors);
  }

  public get ringBuffer(): LoggerRingBuffer {
    return this._ringBuffer;
  }

  public dumpConfigurationIntoLog(): void {
    this.error('ERROR enabled');
    this.warn('WARN enabled');
    this.info('INFO enabled');
    this.verbose('VERBOSE enabled');
    this.debug('DEBUG enabled');
    this.silly('SILLY enabled');
  }

  public dumpOptionsIntoLog(): void {
    this.info('Guid: %s Options: %j', this._guid, this.options);
    if (this?.options?.preProcessors?.length) {
      const labels: string[] = this.options.preProcessors.map((p) => StringRatchet.trimToNull(p.label()) || 'Unlabelled');
      this.info('Preprocessors: %j', labels);
    }
  }

  public get guid(): number {
    return this._guid;
  }

  // This will always clear the buffer
  public changeRingBufferSize(newSize: number): void {
    this._ringBuffer = null;
    if (newSize) {
      this._ringBuffer = new LoggerRingBuffer(newSize);
      this._options.ringBufferSize = newSize;
    }
  }

  public updateTracePrefix(newValue: string): void {
    this._options.trace = newValue;
  }

  public get options(): LoggerOptions {
    return Object.assign({}, this._options);
  }

  public set options(newOpts: LoggerOptions) {
    this._options = Object.assign({}, newOpts);
    if (this._options.ringBufferSize) {
      this._ringBuffer = new LoggerRingBuffer(this._options.ringBufferSize);
    }
    // Setup the formatter
    switch (this._options.formatType) {
      case LogMessageFormatType.None:
        this._formatter = new NoneLogMessageFormatter();
        break;
      case LogMessageFormatType.StructuredJson:
        this._formatter = new StructuredJsonLogMessageFormatter();
        break;
      case LogMessageFormatType.SingleLineNoLevel:
        this._formatter = new SingleLineNoLevelLogMessageFormatter();
        break;
      default:
        this._formatter = new ClassicSingleLineLogMessageFormatter();
        break;
    }
    this._level = this._options.initialLevel;
    this._handlerFunctionMap = LoggerUtil.handlerFunctionMap(this._options.outputFunction);

    const oldId: string = this._loggerMeta ? this._loggerMeta.loggerInstanceId : null;
    this._loggerMeta = {
      options: this._options,
      loggerInstanceName: this.loggerInstanceName,
      loggerInstanceId: oldId || StringRatchet.createRandomHexString(8),
    };
  }

  public get level(): LoggerLevelName {
    return this._level;
  }

  public set level(newLevel: LoggerLevelName) {
    if (!newLevel) {
      throw new Error('Cannot set level to null/undefined');
    }
    this._level = newLevel;
  }

  public consoleLogPassThru(level: LoggerLevelName, ...input: any[]): void {
    if (LoggerUtil.levelIsEnabled(level, this._level)) {
      let passThruPrefix: string = this._options.trace || '';
      passThruPrefix += '[' + level + '] ';
      input.unshift(passThruPrefix);
      const fn: (...any) => void = this._handlerFunctionMap.get(level) || LoggerUtil.defaultHandlerFunction;
      fn(...input);
    }
  }

  public createLogMessage(level: LoggerLevelName, params: Record<string, string>, format: string, ...input: any[]): LogMessage {
    const rval: LogMessage = {
      lvl: level,
      timestamp: Date.now(),
      messageSource: format,
      subsVars: input,
      params: params,
    };
    return rval;
  }

  public formatMessage(msg: LogMessage): string {
    const rval: string = msg ? this._formatter.formatMessage(msg, this._loggerMeta) : null;
    return rval;
  }

  public formatMessages(msgs: LogMessage[]): string[] {
    const rval: string[] = (msgs || []).map((m) => this.formatMessage(m)).filter((m) => !!m);
    return rval;
  }

  public recordMessageBuilder(msgBuild: LogMessageBuilder): string {
    return this.recordMessage(msgBuild.toMessage());
  }

  public recordMessage(inMsg: LogMessage): string {
    let rval: string = null;
    if (LoggerUtil.levelIsEnabled(inMsg.lvl, this._level)) {
      let msg: LogMessage = Object.assign({}, inMsg);
      // If there are any preprocessors, run them
      if (this._options.preProcessors?.length) {
        for (const proc of this._options.preProcessors) {
          msg = proc.process(msg);
        }
      }
      // Now, generate the actual string to log
      rval = this.formatMessage(msg);
      if (rval) {
        const fn: (...any) => void = this._handlerFunctionMap.get(msg.lvl) || LoggerUtil.defaultHandlerFunction;
        fn(rval);
        if (this._ringBuffer) {
          this._ringBuffer.addToRingBuffer(msg);
        }
      }
    } else {
      // Do nothing, not enabled
    }
    return rval;
  }

  public error(format: string, ...input: any[]): string {
    const msg: LogMessage = this.createLogMessage(LoggerLevelName.error, {}, format, ...input);
    return this.recordMessage(msg);
  }

  public errorP(...input: any[]): void {
    this.consoleLogPassThru(LoggerLevelName.error, ...input);
  }

  public warn(format: string, ...input: any[]): string {
    const msg: LogMessage = this.createLogMessage(LoggerLevelName.warn, {}, format, ...input);
    return this.recordMessage(msg);
  }

  public warnP(...input: any[]): void {
    this.consoleLogPassThru(LoggerLevelName.warn, ...input);
  }

  public info(format: string, ...input: any[]): string {
    const msg: LogMessage = this.createLogMessage(LoggerLevelName.info, {}, format, ...input);
    return this.recordMessage(msg);
  }

  public infoP(...input: any[]): void {
    this.consoleLogPassThru(LoggerLevelName.info, ...input);
  }

  public verbose(format: string, ...input: any[]): string {
    const msg: LogMessage = this.createLogMessage(LoggerLevelName.verbose, {}, format, ...input);
    return this.recordMessage(msg);
  }

  public verboseP(...input: any[]): void {
    this.consoleLogPassThru(LoggerLevelName.verbose, ...input);
  }

  public debug(format: string, ...input: any[]): string {
    const msg: LogMessage = this.createLogMessage(LoggerLevelName.debug, {}, format, ...input);
    return this.recordMessage(msg);
  }

  public debugP(...input: any[]): void {
    // This is here because old versions of Node do not support console.debug
    this.consoleLogPassThru(LoggerLevelName.debug, ...input);
  }

  public silly(format: string, ...input: any[]): string {
    const msg: LogMessage = this.createLogMessage(LoggerLevelName.silly, {}, format, ...input);
    return this.recordMessage(msg);
  }

  public sillyP(...input: any[]): void {
    this.consoleLogPassThru(LoggerLevelName.silly, ...input);
  }

  public logByLevel(level: LoggerLevelName, format: string, ...input: any[]): void {
    const msg: LogMessage = this.createLogMessage(level, {}, format, ...input);
    this.recordMessage(msg);
  }

  public importMessages(msgs: LogMessage[], prefixIn = '', addTimestamp = true): void {
    const prefix: string = prefixIn || '';
    if (msgs && msgs.length > 0) {
      this.silly('Received import data : %d msgs', msgs.length);

      // Pump messages
      msgs.forEach((m) => {
        if (m.messageSource) {
          let mOut: string = prefix;
          if (addTimestamp) {
            const ts: string = String(new Date()).substring(15, 24);
            mOut += ' (' + ts + ') : ';
            mOut += m.messageSource;
          }
          this.logByLevel(m.lvl, mOut);
        }
      });
    }
  }
}
