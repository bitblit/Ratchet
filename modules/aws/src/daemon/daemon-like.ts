import { DaemonProcessState } from './daemon-process-state.js';
import { DaemonProcessCreateOptions } from './daemon-process-create-options.js';

/*
    Classes implementing this interface provide the ability to monitor and update long-running
    processes in S3.

    For all functions, if group is not provided the default group will be used.
*/
export interface DaemonLike {
  get defaultGroup(): string;

  keyToPublicToken(key: string, expirationSeconds: number): Promise<string>;

  start(options: DaemonProcessCreateOptions): Promise<DaemonProcessState>;

  clean(group?: string, olderThanSeconds?: number): Promise<DaemonProcessState[]>;

  listKeys(group?: string): Promise<string[]>;

  list(group?: string): Promise<DaemonProcessState[]>;

  updateMessage(id: string, newMessage: string): Promise<DaemonProcessState>;

  statFromPublicToken(publicToken: string): Promise<DaemonProcessState>;

  stat(key: string): Promise<DaemonProcessState>;

  abort(id: string): Promise<DaemonProcessState>;

  error(id: string, error: string): Promise<DaemonProcessState>;

  finalize(id: string, contents: Buffer): Promise<DaemonProcessState>;
}
