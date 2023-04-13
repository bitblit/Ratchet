import { BackgroundExecutionListener } from './background-execution-listener.js';
import { BackgroundExecutionEvent } from './background-execution-event.js';
import { BackgroundExecutionEventType } from './background-execution-event-type.js';
import { DynamoRatchetLike } from '@bitblit/ratchet-aws/dist/dynamodb/dynamo-ratchet-like.js';
import { BackgroundProcessLogTableEntry } from './background-process-log-table-entry.js';
import { ContextUtil } from '../util/context-util.js';

/*
Table should be
- Hash key : guid
- Range key: timestamp
 */
export class BackgroundDynamoLogTableHandler<T> implements BackgroundExecutionListener<T> {
  constructor(private dynamo: DynamoRatchetLike, private tableName: string, private env: string, private backgroundQueueName: string) {}

  async onEvent(event: BackgroundExecutionEvent<T>): Promise<void> {
    const entry: BackgroundProcessLogTableEntry = {
      env: this.env,
      backgroundQueueName: this.backgroundQueueName,
      requestId: ContextUtil.currentRequestId(),
      guid: event.guid,
      processTypeName: event.processorType,
      state: event.type.toString(),
      timestampEpochMs: new Date().getTime(),
    };

    if (event.type == BackgroundExecutionEventType.DataValidationError) {
      const errors: string[] = event?.errors?.length ? event.errors : ['No-Error']; // DDB does not allow empty sets
      entry.errors = errors;
    } else if (event.type == BackgroundExecutionEventType.ProcessStarting) {
      entry.params = event.data;
    } else if (event.type == BackgroundExecutionEventType.ExecutionFailedError) {
      const errors: string[] = event?.errors?.length ? event.errors : ['No-Error']; // DDB does not allow empty sets
      entry.errors = errors;
    }

    await this.dynamo.simplePut(this.tableName, entry);
  }
}
