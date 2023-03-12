import { LoggerLevelName } from './logger-level-name';
import { LogMessage } from './log-message';

export class LogMessageBuilder {
  private wrapped: LogMessage;

  constructor(lvl: LoggerLevelName, messageSource?: string) {
    if (!lvl) {
      throw Error('Cannot set level to null/undefined');
    }
    this.wrapped = { lvl: lvl, timestamp: Date.now(), messageSource: messageSource };
  }

  public clone(): LogMessageBuilder {
    const rval: LogMessageBuilder = new LogMessageBuilder(this.wrapped.lvl, this.wrapped.messageSource);
    rval.wrapped = Object.assign({}, this.wrapped);
    return rval;
  }

  public level(lvl: LoggerLevelName): LogMessageBuilder {
    if (!lvl) {
      throw Error('Cannot set level to null/undefined');
    }
    this.wrapped.lvl = lvl;
    return this;
  }

  public timestamp(val: number): LogMessageBuilder {
    if (!val) {
      throw Error('Cannot set timestamp to null/undefined');
    }
    this.wrapped.timestamp = val;
    return this;
  }

  public messageSource(val: string): LogMessageBuilder {
    this.wrapped.messageSource = val;
    return this;
  }

  public subVars(val: any[]): LogMessageBuilder {
    this.wrapped.subsVars = val || [];
    return this;
  }

  public params(val: Record<string, string | number | boolean>): LogMessageBuilder {
    this.wrapped.params = val || {};
    return this;
  }

  public p(name: string, value: string | number | boolean): LogMessageBuilder {
    this.wrapped.params = this.wrapped.params || {};
    this.wrapped.params[name] = value;
    return this;
  }

  public toMessage(): LogMessage {
    return Object.assign({}, this.wrapped);
  }
}
