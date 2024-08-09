
import { DaemonProcessState } from './daemon-process-state.js';
import { S3CacheRatchet } from '../s3/s3-cache-ratchet.js';
import { DaemonProcessCreateOptions } from './daemon-process-create-options.js';
import { DaemonUtil } from './daemon-util.js';
import { DaemonLike } from './daemon-like.js';
import { DaemonProcessStatePublicToken } from './daemon-process-state-public-token.js';
import { S3Client } from '@aws-sdk/client-s3';
import { S3CacheRatchetLike } from '../s3/s3-cache-ratchet-like.js';
import { JwtRatchetLike } from "@bitblit/ratchet-common/jwt/jwt-ratchet-like";
import { RequireRatchet } from "@bitblit/ratchet-common/lang/require-ratchet";
import { StringRatchet } from "@bitblit/ratchet-common/lang/string-ratchet";
import { Logger } from "@bitblit/ratchet-common/logger/logger";

export class Daemon implements DaemonLike {
  public static DEFAULT_DEFAULT_GROUP: string = 'DEFAULT';

  private cache: S3CacheRatchetLike;

  constructor(
    private s3: S3Client,
    private bucket: string,
    private prefix: string = '',
    private _defaultGroup: string = Daemon.DEFAULT_DEFAULT_GROUP,
    private jwtRatchet?: JwtRatchetLike
  ) {
    this.cache = new S3CacheRatchet(this.s3, this.bucket);
  }

  public get defaultGroup(): string {
    return this._defaultGroup;
  }

  public async keyToPublicToken(key: string, expirationSeconds: number): Promise<string> {
    RequireRatchet.notNullOrUndefined(this.jwtRatchet, 'You must set jwtRatchet if you wish to use public tokens');
    RequireRatchet.notNullOrUndefined(key, 'key');
    RequireRatchet.true(expirationSeconds > 0, 'Expiration seconds must be larger than 0');

    const token: DaemonProcessStatePublicToken = { daemonKey: key };
    const publicToken: string = await this.jwtRatchet.createTokenString(token, expirationSeconds);
    return publicToken;
  }

  private keyToPath(key: string): string {
    return Buffer.from(key, 'base64').toString();
  }

  private pathToKey(path: string): string {
    return Buffer.from(path).toString('base64');
  }

  private generatePath(group: string = this._defaultGroup): string {
    return this.generatePrefix(group) + StringRatchet.createType4Guid();
  }

  private generatePrefix(group: string = this._defaultGroup): string {
    return this.prefix + group + '/';
  }

  public async start(options: DaemonProcessCreateOptions): Promise<DaemonProcessState> {
    options.group = options.group || this._defaultGroup;
    const path: string = this.generatePath(options.group);
    const key: string = this.pathToKey(path);
    return DaemonUtil.start(this.cache, key, path, options);
  }

  private async writeState(newState: DaemonProcessState, contents: Buffer): Promise<DaemonProcessState> {
    const key: string = this.keyToPath(newState.id);
    return DaemonUtil.writeState(this.cache, key, newState, contents);
  }

  public async clean(group: string = this._defaultGroup, olderThanSeconds: number = 60 * 60 * 24 * 7): Promise<DaemonProcessState[]> {
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

  public async listKeys(group: string = this._defaultGroup): Promise<string[]> {
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

  public async list(group: string = this._defaultGroup): Promise<DaemonProcessState[]> {
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

  public async stat(key: string): Promise<DaemonProcessState> {
    const itemPath: string = this.keyToPath(key);
    return DaemonUtil.stat(this.cache, itemPath);
  }

  public async statFromPublicToken(publicToken: string): Promise<DaemonProcessState> {
    RequireRatchet.notNullOrUndefined(this.jwtRatchet, 'You must set jwtRatchet if you wish to use public tokens');
    RequireRatchet.notNullOrUndefined(publicToken, 'publicToken');
    const parsed: DaemonProcessStatePublicToken = await this.jwtRatchet.decodeToken<DaemonProcessStatePublicToken>(publicToken);
    const key: string = parsed?.daemonKey;
    return key ? this.stat(key) : null;
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
