import AWS from 'aws-sdk';
import { Logger } from '../../common/logger';
import { DaemonProcessState } from './daemon-process-state';
import { S3CacheRatchet } from '../s3-cache-ratchet';
import { StringRatchet } from '../../common/string-ratchet';
import { DaemonProcessCreateOptions } from './daemon-process-create-options';
import { DaemonUtil } from './daemon-util';

/*
    Classes implementing this interface provide the ability to monitor and update long-running
    processes in S3.

    For all functions, if group is not provided the default group will be used.
*/
export interface DaemonLike {
  get defaultGroup(): string;

  start(options: DaemonProcessCreateOptions): Promise<DaemonProcessState>;

  clean(group?: string, olderThanSeconds?: number): Promise<DaemonProcessState[]>;

  listKeys(group?: string): Promise<string[]>;

  list(group?: string): Promise<DaemonProcessState[]>;

  updateMessage(id: string, newMessage: string): Promise<DaemonProcessState>;

  stat(id: string): Promise<DaemonProcessState>;

  abort(id: string): Promise<DaemonProcessState>;

  error(id: string, error: string): Promise<DaemonProcessState>;

  finalize(id: string, contents: Buffer): Promise<DaemonProcessState>;
}
