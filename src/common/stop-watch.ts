import { DurationRatchet } from './duration-ratchet.js';

/*
    Class to simplify timing
*/

export class StopWatch {
  public static readonly DEFAULT_TIMER_NAME: string = 'default';
  private starts: Map<string, number> = new Map<string, number>();
  private ends: Map<string, number> = new Map<string, number>();

  constructor(autoStartDefault: boolean = false) {
    if (autoStartDefault) {
      this.start();
    }
  }

  public start(name: string = StopWatch.DEFAULT_TIMER_NAME): number {
    const now: number = new Date().getTime();
    this.starts.set(name, now);
    return now;
  }

  public stop(name: string = StopWatch.DEFAULT_TIMER_NAME): number {
    const now: number = new Date().getTime();
    this.ends.set(name, now);
    return now;
  }

  public reset(name: string = StopWatch.DEFAULT_TIMER_NAME): void {
    this.starts.delete(name);
    this.ends.delete(name);
  }

  public dump(name: string = StopWatch.DEFAULT_TIMER_NAME, includeMS = true): string {
    let rval: string = 'No timer set for ' + name;
    const start: number = this.starts.get(name);
    const end: number = this.ends.get(name);
    if (!!start && !!end) {
      rval = 'completed in ' + DurationRatchet.formatMsDuration(end - start, includeMS);
    } else if (!!start) {
      rval = 'running for ' + DurationRatchet.formatMsDuration(new Date().getTime() - start, includeMS);
    }
    return rval;
  }

  public dumpExpected(pctComplete: number, name: string = StopWatch.DEFAULT_TIMER_NAME, includeMS = true): string {
    let rval: string = 'No timer set for ' + name;
    if (!pctComplete || pctComplete <= 0) {
      rval = 'Cannot generate output for 0 percent complete';
    } else if (pctComplete > 1) {
      rval = 'Cannot generate output for percent > 1';
    } else {
      const start: number = this.starts.get(name);
      const end: number = this.ends.get(name);
      if (!!start && !!end) {
        rval = name + ' completed in ' + DurationRatchet.formatMsDuration(end - start, includeMS);
      } else if (!!start) {
        const now: number = new Date().getTime();
        const elapsedMS: number = now - start;
        const expectedTotalMS: number = elapsedMS / pctComplete;
        const remainMS: number = expectedTotalMS - elapsedMS;
        rval =
          name +
          ' running for ' +
          DurationRatchet.formatMsDuration(elapsedMS, includeMS) +
          ' approx ' +
          DurationRatchet.formatMsDuration(remainMS, includeMS) +
          ' remaining';
      }
    }
    return rval;
  }

  public elapsedMS(name: string = StopWatch.DEFAULT_TIMER_NAME): number {
    const start: number = this.starts.get(name);
    const end: number = this.ends.get(name);
    if (!!start && !!end) {
      return end - start;
    } else if (!!start) {
      return new Date().getTime() - start;
    } else {
      return 0;
    }
  }
}
