/*
  Wraps an object with an expiring wrapper
 */

import { Logger } from '../logger/logger';
import { ErrorRatchet } from './error-ratchet';
import { LoggerLevelName } from '../logger/logger-level-name';

export class ExpiringObject<T> {
  private _config: ExpiringObjectConfig<T>;
  private _cacheObject: T;
  private _lastUpdatedEpochMS: number;
  private _timeRemainingMS: (lastUpdatedEpochMS: number) => Promise<number>;

  constructor(inputConfig?: ExpiringObjectConfig<T>) {
    this._config = Object.assign({}, this.defaultConfig(), inputConfig || {});
    if (this._config.overrideTimeRemainingMS && this._config.timeToLiveMS) {
      ErrorRatchet.throwFormattedErr('Cannot define both time to live and overrideTimeRemainingMS');
    }
    if (!this._config.overrideTimeRemainingMS && !this._config.timeToLiveMS) {
      ErrorRatchet.throwFormattedErr('Must define exactly one of timeToLiveMS or overrideTimeRemainingMS');
    }
    if (this._config.initialValue) {
      this.update(this._config.initialValue);
    }
    this._timeRemainingMS = this._config.overrideTimeRemainingMS || this.defaultTimeRemainingMS;
  }

  private defaultConfig(): ExpiringObjectConfig<T> {
    const rval: ExpiringObjectConfig<T> = {
      generator: null,
      initialValue: null,
      logLevel: LoggerLevelName.debug,
      overrideTimeRemainingMS: null,
      timeToLiveMS: 1_000 * 60, // Default TTL is 1 minute
    };
    return rval;
  }

  private async defaultTimeRemainingMS(lastUpdatedEpochMS: number): Promise<number> {
    let rval: number = 0;
    if (lastUpdatedEpochMS) {
      const ageMS: number = new Date().getTime() - lastUpdatedEpochMS;
      rval = Math.max(0, this._config.timeToLiveMS - ageMS);
    }
    return rval;
  }

  public update(newValue: T, doNotUpdateClock: boolean = false): void {
    this._cacheObject = newValue;
    if (!doNotUpdateClock) {
      this._lastUpdatedEpochMS = new Date().getTime();
    }
    Logger.logByLevel(this._config.logLevel, 'Updated cache value to %j', newValue);
  }

  public async fetchCacheObjectTimeRemainingMS(): Promise<number> {
    return this._timeRemainingMS(this._lastUpdatedEpochMS);
  }

  public async fetch(): Promise<T> {
    const remainMS: number = await this._timeRemainingMS(this._lastUpdatedEpochMS);
    if (!remainMS) {
      this._cacheObject = null;
      this._lastUpdatedEpochMS = null;
    }
    if (!this._cacheObject) {
      if (this._config.generator) {
        const newValue: T = await this._config.generator();
        Logger.logByLevel(this._config.logLevel, 'Auto call to generator returned %j', newValue);
        this.update(newValue);
      }
    }
    return this._cacheObject;
  }
}

export class ExpiringObjectConfig<T> {
  timeToLiveMS?: number;
  generator?: () => Promise<T>;
  initialValue?: T;
  logLevel?: LoggerLevelName;
  overrideTimeRemainingMS?: (lastUpdatedEpochMS: number) => Promise<number>;
}
