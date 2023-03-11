import { LogMessage } from './log-message';
import { LogSnapshot } from './log-snapshot';
import { Logger } from '../logger';
import { LoggerLevelName } from './logger-level-name';

export class LoggerRingBuffer {
  private _lastLogMessage: LogMessage = { messageSource: 'No message yet', timestamp: new Date().getTime(), lvl: LoggerLevelName.info };

  private _buffer: LogMessage[] = [];
  private _bufferIdx = 0;
  private _lastSnapshotIdx = 0;
  private _bufferSize: number;

  constructor(size: number) {
    if (!size) {
      throw new Error('Cannot create ring buffer of size 0');
    }
    this._bufferSize = size;
  }

  public get currentIndex(): number {
    return this._bufferIdx;
  }

  public get lastSnapshotIdx(): number {
    return this._lastSnapshotIdx;
  }

  public set bufferSize(newSize: number) {
    if (!newSize) {
      throw new Error('Cannot create ring buffer of size 0');
    }
    this._bufferSize = newSize;
    this.clearRingBuffer();
  }

  public getMessages(inStartFrom: number = null, clear = false, reverseSort = false): LogMessage[] {
    let rval: LogMessage[] = null;
    if (this._bufferIdx < this._bufferSize) {
      const start: number = inStartFrom == null ? 0 : inStartFrom;
      rval = this._buffer.slice(start, this._bufferIdx); // Use slice to get a copy (should use below too)
    } else {
      rval = [];

      const firstIdx = this._bufferIdx - this._bufferSize;
      const startFrom = inStartFrom ? Math.max(inStartFrom, firstIdx) : firstIdx;

      for (let i = startFrom; i < this._bufferIdx; i++) {
        rval.push(this._buffer[i % this._bufferSize]);
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

  public takeSnapshot(): LogSnapshot {
    const trailingEdge = Math.max(0, this._bufferIdx - this._bufferSize);
    const rval: LogSnapshot = {
      messages: Logger.getMessages(this._lastSnapshotIdx),
      logMessagesTruncated: Math.max(0, trailingEdge - this._lastSnapshotIdx),
    } as LogSnapshot;

    this._lastSnapshotIdx = this._bufferIdx;
    return rval;
  }

  public getLastLogMessage(): LogMessage {
    return Object.assign({}, this._lastLogMessage);
  }

  private clearRingBuffer() {
    this._buffer = [];
    this._bufferIdx = 0;
    this._lastSnapshotIdx = 0;
    Logger.info('Cleared ring buffer (size is now %d)', this._bufferSize);
  }

  public addToRingBuffer(newMsg: LogMessage): void {
    this._lastLogMessage = newMsg;
    this._buffer[this._bufferIdx % this._bufferSize] = newMsg;
    this._bufferIdx++; // advance
  }
}
