import * as AWS from 'aws-sdk';
import { Logger } from '../../common/logger.js';
import { DaemonProcessState } from './daemon-process-state.js';
import { S3CacheRatchet } from '../s3-cache-ratchet.js';
import { StringRatchet } from '../../common/string-ratchet.js';
import { DaemonProcessCreateOptions } from './daemon-process-create-options.js';
import { DaemonUtil } from './daemon-util.js';

export class Daemon {
  public static DEFAULT_GROUP: string = 'DEFAULT';

  private cache: S3CacheRatchet;

  constructor(private s3: AWS.S3, private bucket: string, private prefix: string = '') {
    this.cache = new S3CacheRatchet(this.s3, this.bucket);
  }

  private keyToPath(key: string): string {
    return Buffer.from(key, 'base64').toString();
  }

  private pathToKey(path: string): string {
    return Buffer.from(path).toString('base64');
  }

  private generatePath(group: string = Daemon.DEFAULT_GROUP): string {
    return this.generatePrefix(group) + StringRatchet.createType4Guid();
  }

  private generatePrefix(group: string = Daemon.DEFAULT_GROUP): string {
    return this.prefix + group + '/';
  }

  public async start(options: DaemonProcessCreateOptions): Promise<DaemonProcessState> {
    options.group = options.group || Daemon.DEFAULT_GROUP;
    const path: string = this.generatePath(options.group);
    const key: string = this.pathToKey(path);
    return DaemonUtil.start(this.cache, key, path, options);
  }

  private async writeState(newState: DaemonProcessState, contents: Buffer): Promise<DaemonProcessState> {
    const key: string = this.keyToPath(newState.id);
    return DaemonUtil.writeState(this.cache, key, newState, contents);
  }

  public async clean(group: string = Daemon.DEFAULT_GROUP, olderThanSeconds: number = 60 * 60 * 24 * 7): Promise<DaemonProcessState[]> {
    try {
      Logger.info('Daemon removing items older than %d seconds from group %s', olderThanSeconds, group);
      const original: DaemonProcessState[] = await this.list(group);
      const now: number = new Date().getTime();
      const removed: DaemonProcessState[] = [];
      for (let i = 0; i < original.length; i++) {
        const test: DaemonProcessState = original[i];
        const ageSeconds: number = (now - test.startedEpochMS) / 1000;
        if (ageSeconds > olderThanSeconds) {
          const remove: any = await this.cache.removeCacheFile(this.keyToPath(test.id));
          removed.push(test);
        }
      }
      Logger.debug('Removed %d of %d items', removed.length, original.length);
      return removed;
    } catch (err) {
      Logger.error('Error while trying to clean a daemon: %j %s', group, err);
      throw err;
    }
  }

  public async listKeys(group: string = Daemon.DEFAULT_GROUP): Promise<string[]> {
    try {
      const prefix: string = this.generatePrefix(group);
      Logger.info('Fetching children of %s', prefix);
      const rval: string[] = await this.cache.directChildrenOfPrefix(prefix);
      Logger.debug('Found : %j', rval);
      return rval;
    } catch (err) {
      Logger.error('Error while trying to list daemon keys: %j %s', group, err);
      throw err;
    }
  }

  public async list(group: string = Daemon.DEFAULT_GROUP): Promise<DaemonProcessState[]> {
    try {
      const prefix: string = this.generatePrefix(group);
      Logger.info('Fetching children of %s', prefix);
      const keys: string[] = await this.listKeys(group);
      const proms: Promise<DaemonProcessState>[] = keys.map((k) => this.stat(this.pathToKey(this.generatePrefix(group) + k)));
      const rval: DaemonProcessState[] = await Promise.all(proms);

      return rval;
    } catch (err) {
      Logger.error('Error while trying to list daemon states: %j %s', group, err);
      throw err;
    }
  }

  public async updateMessage(id: string, newMessage: string): Promise<DaemonProcessState> {
    const itemPath: string = this.keyToPath(id);
    return DaemonUtil.updateMessage(this.cache, itemPath, newMessage);
  }

  public async stat(id: string): Promise<DaemonProcessState> {
    const itemPath: string = this.keyToPath(id);
    return DaemonUtil.stat(this.cache, itemPath);
  }

  public async abort(id: string): Promise<DaemonProcessState> {
    return DaemonUtil.abort(this.cache, this.keyToPath(id));
  }
  public async error(id: string, error: string): Promise<DaemonProcessState> {
    return DaemonUtil.error(this.cache, this.keyToPath(id), error);
  }

  public async finalize(id: string, contents: Buffer): Promise<DaemonProcessState> {
    return DaemonUtil.finalize(this.cache, this.keyToPath(id), contents);
  }
}
