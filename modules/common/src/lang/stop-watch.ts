import { DurationRatchet } from './duration-ratchet.js';
import { StringRatchet } from './string-ratchet.js';
import { RequireRatchet } from './require-ratchet.js';
import { LoggerLevelName } from '../logger/logger-level-name.js';
import { Logger } from '../logger/logger.js';

/*
    Class to simplify timing
*/

export class StopWatch {
  private starts: Map<string, number> = new Map<string, number>();
  private ends: Map<string, number> = new Map<string, number>();

  private createTime: number = Date.now();

  constructor(private label: string = StringRatchet.createRandomHexString(4)) {}

  public start(name: string): number {
    RequireRatchet.notNullUndefinedOrOnlyWhitespaceString(name, 'name');
    const now: number = Date.now();
    this.starts.set(StringRatchet.trimToNull(name), now);
    return now;
  }

  public stop(name: string): number {
    RequireRatchet.notNullUndefinedOrOnlyWhitespaceString(name, 'name');
    const now: number = Date.now();
    this.ends.set(StringRatchet.trimToNull(name), now);
    return now;
  }

  public reset(name: string): void {
    RequireRatchet.notNullUndefinedOrOnlyWhitespaceString(name, 'name');
    this.starts.delete(StringRatchet.trimToNull(name));
    this.ends.delete(StringRatchet.trimToNull(name));
  }

  public hasTimer(name: string): boolean {
    RequireRatchet.notNullUndefinedOrOnlyWhitespaceString(name, 'name');
    return this.starts.has(name);
  }

  public log(name?: string, shortForm?: boolean, logLevel: LoggerLevelName = LoggerLevelName.info): void {
    Logger.logByLevel(logLevel, this.dump(name, shortForm));
  }

  public logExpected(pctComplete: number, name?: string, shortForm?: boolean, logLevel: LoggerLevelName = LoggerLevelName.info): void {
    Logger.logByLevel(logLevel, this.dumpExpected(pctComplete, name, shortForm));
  }

  public dump(name?: string, shortForm?: boolean): string {
    let rval: string = this.label + ' ';
    const cleanName: string = StringRatchet.trimToNull(name);
    if (cleanName && !this.hasTimer(cleanName)) {
      rval += 'No such timer : ' + cleanName;
    } else {
      const start: number = name ? this.starts.get(cleanName) : this.createTime;
      const end: number = name ? this.ends.get(cleanName) : Date.now();
      rval += (cleanName || 'Default') + ' ';
      if (!!start && !!end) {
        rval += 'completed in ' + DurationRatchet.formatMsDuration(end - start, !shortForm);
      } else if (!!start) {
        rval += 'running for ' + DurationRatchet.formatMsDuration(Date.now() - start, !shortForm);
      }
    }
    return rval;
  }

  public dumpExpected(pctComplete: number, name?: string, shortForm?: boolean): string {
    let rval: string = this.label + ' ';
    const cleanName: string = StringRatchet.trimToNull(name);
    if (cleanName && !this.hasTimer(cleanName)) {
      rval += 'No such timer : ' + cleanName;
    } else {
      if (!pctComplete || pctComplete <= 0) {
        rval += 'Cannot generate output for 0 percent complete';
      } else if (pctComplete > 1) {
        rval += 'Cannot generate output for percent > 1';
      } else {
        rval += (cleanName || 'Default') + ' ';
        const start: number = name ? this.starts.get(cleanName) : this.createTime;
        const end: number = name ? this.ends.get(cleanName) : Date.now();
        if (!!start && !!end) {
          rval += 'completed in ' + DurationRatchet.formatMsDuration(end - start, !shortForm);
        } else if (!!start) {
          const now: number = Date.now();
          const elapsedMS: number = now - start;
          const expectedTotalMS: number = elapsedMS / pctComplete;
          const remainMS: number = expectedTotalMS - elapsedMS;
          rval +=
            'running for ' +
            DurationRatchet.formatMsDuration(elapsedMS, !shortForm) +
            ' approx ' +
            DurationRatchet.formatMsDuration(remainMS, !shortForm) +
            ' remaining';
        }
      }
    }
    return rval;
  }

  public elapsedMS(name?: string): number {
    let rval: number = null;
    const cleanName: string = StringRatchet.trimToNull(name);
    if (cleanName && !this.hasTimer(cleanName)) {
      rval = null;
    } else {
      const start: number = name ? this.starts.get(cleanName) : this.createTime;
      const end: number = name ? this.ends.get(cleanName) : Date.now();
      if (!!start && !!end) {
        rval = end - start;
      } else if (!!start) {
        rval = Date.now() - start;
      }
    }
    return rval;
  }
}
