
import * as AWS from 'aws-sdk';
import {Logger} from '../../common/logger';
import {DaemonProcessState} from './daemon-process-state';
import {S3CacheRatchet} from '../s3-cache-ratchet';
import {StringRatchet} from '../../common/string-ratchet';
import {DaemonProcessCreateOptions} from './daemon-process-create-options';

export class Daemon {
    public static DEFAULT_GROUP: string = 'DEFAULT';
    public static DEFAULT_CONTENT: Buffer = Buffer.from('DAEMON_PLACEHOLDER');
    public static DAEMON_METADATA_KEY: string = 'daemon_meta'; // Must be lowercase for s3

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
        options.meta = options.meta || {};

        Logger.info('Starting daemon, options: %j', options);
        const key: string = this.pathToKey(this.generatePath(options.group));
        const now: number = new Date().getTime();

        const newState: DaemonProcessState = {
            id: key,

            title: options.title,
            lastUpdatedEpochMS: now,
            lastUpdatedMessage: 'Created',
            targetFileName: options.targetFileName,

            startedEpochMS: now,
            completedEpochMS: null,
            meta: options.meta,
            error: null,
            link: null,
            contentType: options.contentType
        } as DaemonProcessState;

        const rval: DaemonProcessState = await this.writeStat(newState, Daemon.DEFAULT_CONTENT);
        return rval;
    }

    private async writeStat(newState: DaemonProcessState, contents: Buffer): Promise<DaemonProcessState> {
        const s3meta: any = {};
        newState.lastUpdatedEpochMS = new Date().getTime();
        s3meta[Daemon.DAEMON_METADATA_KEY] = JSON.stringify(newState);

        const params = {
            Bucket: this.bucket,
            Key: this.keyToPath(newState.id),
            ContentType: newState.contentType,
            Metadata: s3meta,
            Body: contents
        };
        if (newState.targetFileName) {
            params['ContentDisposition'] = 'attachment;filename="'+newState+'"';
        }

        const written = await this.s3.putObject(params).promise();
        Logger.silly('Daemon wrote : %s', written);
        return this.stat(newState.id);
    }

    public async clean(group: string = Daemon.DEFAULT_GROUP, olderThanSeconds: number = 60*60*24*7): Promise<DaemonProcessState[]> {
        Logger.info('Daemon removing items older than %d seconds from group %s', olderThanSeconds, group);
        const original: DaemonProcessState[] = await this.list(group);
        const now: number = new Date().getTime();
        const removed: DaemonProcessState[] = [];
        for (let i=0;i<original.length;i++) {
            const test: DaemonProcessState = original[i];
            const ageSeconds: number = (now-test.startedEpochMS) /1000;
            if (ageSeconds > olderThanSeconds) {
                const remove: any = await this.cache.removeCacheFile(this.keyToPath(test.id));
                removed.push(test);
            }
        }
        Logger.debug('Removed %d of %d items', removed.length, original.length);
        return removed;
    }

    public async listKeys(group: string = Daemon.DEFAULT_GROUP): Promise<string[]> {
        const prefix: string = this.generatePrefix(group);
        Logger.info('Fetching children of %s', prefix);
        const rval: string[] = await this.cache.directChildrenOfPrefix(prefix);
        Logger.debug('Found : %j', rval);
        return rval;
    }


    public async list(group: string = Daemon.DEFAULT_GROUP): Promise<DaemonProcessState[]> {
        const prefix: string = this.generatePrefix(group);
        Logger.info('Fetching children of %s', prefix);
        const keys: string[] = await this.listKeys(group);
        const proms: Promise<DaemonProcessState>[] = keys.map(k => this.stat(this.pathToKey(this.generatePrefix(group) + k)));
        const rval: DaemonProcessState[] = await Promise.all(proms);

        return rval;
    }

    public async updateMessage(id:string, newMessage: string): Promise<DaemonProcessState> {
        const inStat: DaemonProcessState = await this.stat(id);
        inStat.lastUpdatedMessage = newMessage;
        return this.writeStat(inStat, Daemon.DEFAULT_CONTENT);
    }

    public async stat(id:string): Promise<DaemonProcessState> {
        const path: string = this.keyToPath(id);
        Logger.debug('Daemon stat for %s (path %s)', id, path);
        let stat: DaemonProcessState = null;


        const meta: any = await this.cache.fetchMetaForCacheFile(path);
        Logger.debug('Daemon: Meta is %j', meta);
        const metaString: string = (meta && meta['Metadata']) ? meta['Metadata'][Daemon.DAEMON_METADATA_KEY] : null;
        if (metaString) {
            stat = JSON.parse(metaString) as DaemonProcessState;

            if (stat.completedEpochMS && !stat.error) {
                stat.link = this.cache.preSignedDownloadUrlForCacheFile(path);
            }
        } else {
            Logger.warn('No metadata found!');
        }
        return stat;
    }

    public async abort(id:string): Promise<DaemonProcessState> {
        return this.error(id, 'Aborted');
    }
    public async error(id:string, error: string): Promise<DaemonProcessState> {
        const inStat: DaemonProcessState = await this.stat(id);
        inStat.error = error;
        inStat.completedEpochMS = new Date().getTime();
        return this.writeStat(inStat, Daemon.DEFAULT_CONTENT);
    }

    public async finalize(id:string, contents: Buffer): Promise<DaemonProcessState> {
        Logger.info('Finalizing daemon %s with %d bytes', id, contents.length);
        const inStat: DaemonProcessState = await this.stat(id);
        inStat.completedEpochMS = new Date().getTime();
        inStat.lastUpdatedMessage = 'Complete';

        return this.writeStat(inStat, contents);
    }

}