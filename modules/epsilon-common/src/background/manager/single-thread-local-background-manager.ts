import { Subject } from 'rxjs';
import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { BackgroundEntry } from '../background-entry.js';
import { InternalBackgroundEntry } from '../internal-background-entry.js';
import { AbstractBackgroundManager } from './abstract-background-manager.js';

/**
 * Handles all submission of work to the background processing system.
 *
 * Note that this does NOT validate the input, it just passes it along.  This is
 * because it creates a circular reference to the processors if we try since they
 * define the type and validation.
 */
export class SingleThreadLocalBackgroundManager extends AbstractBackgroundManager {
  private _localBus: Subject<InternalBackgroundEntry<any>> = new Subject<InternalBackgroundEntry<any>>();

  public readonly backgroundManagerName: string = 'SingleThreadLocalBackgroundManager';

  // Super constructor automatically called
  public immediateProcessQueue?(): Subject<InternalBackgroundEntry<any>> {
    return this._localBus;
  }

  public async addEntryToQueue<T>(entry: BackgroundEntry<T>, fireStartMessage?: boolean): Promise<string> {
    const wrapped: InternalBackgroundEntry<T> = await this.wrapEntryForInternal(entry);
    const rval: string = wrapped.guid;
    Logger.info('Add entry to queue (local) : %j : Start : %s', entry, fireStartMessage);
    this._localBus.next(wrapped);
    return rval;
  }

  public async fireImmediateProcessRequest<T>(entry: BackgroundEntry<T>): Promise<string> {
    let rval: string = null;
    const wrapped: InternalBackgroundEntry<T> = await this.wrapEntryForInternal(entry);
    rval = wrapped.guid;
    Logger.info('Fire immediately (local) : %j ', entry);
    this._localBus.next(wrapped);
    return rval;
  }

  public async fireStartProcessingRequest(): Promise<string> {
    let rval: string = null;
    Logger.info('Fire start processing request (local, ignored)');
    rval = 'NO-OP';
    return rval;
  }

  public async fetchApproximateNumberOfQueueEntries(): Promise<number> {
    let rval: number = null;
    rval = 0; // No queue when running locally
    return rval;
  }

  public async takeEntryFromBackgroundQueue(): Promise<InternalBackgroundEntry<any>[]> {
    Logger.info('Called takeEntryFromBackgroundQueue on SingleThreadedLocal - returning empty');
    return [];
  }
}
