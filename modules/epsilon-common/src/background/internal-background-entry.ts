import { BackgroundEntry } from './background-entry.js';

export interface InternalBackgroundEntry<T> extends BackgroundEntry<T> {
  guid: string;
  createdEpochMS: number;
  traceId: string;
  traceDepth: number;
}
