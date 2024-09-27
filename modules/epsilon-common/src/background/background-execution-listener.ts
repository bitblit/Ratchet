import { BackgroundExecutionEvent } from './background-execution-event.js';

export interface BackgroundExecutionListener<T> {
  label?: string;
  onEvent(event: BackgroundExecutionEvent<T>): Promise<void>;
}
