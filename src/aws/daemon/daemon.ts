
import * as AWS from 'aws-sdk';
import {Logger} from '../../common/logger';
import * as moment from 'moment-timezone';
import {DaemonProcessState} from './daemon-process-state';
import {S3CacheRatchet} from '../s3-cache-ratchet';
import {StringRatchet} from '../../common/string-ratchet';

export class Daemon {
    public static DEFAULT_GROUP: string = 'DEFAULT';
    public static DEFAULT_CONTENT: string = 'DAEMON_PLACEHOLDER';
    public static DAEMON_METADATA_KEY: string = 'DAEMON_META';

    private cache: S3CacheRatchet;

    constructor(private s3: AWS.S3, private bucket: string, private timeZone: string = 'UTC', private prefix: string = '') {
        this.cache = new S3CacheRatchet(this.s3, this.bucket);
    }

    private generateKey(group: string = Daemon.DEFAULT_GROUP, date:Date = new Date()): string {
        return this.generatePrefix(group, date) + '/' + StringRatchet.createType4Guid();
    }

    private generatePrefix(group: string = Daemon.DEFAULT_GROUP, date:Date = new Date()): string {
        return this.prefix + moment(date).tz(this.timeZone).format('YYYY/MM/DD') + '/' + group;
    }

    public async start(title: string, contentType: string, group: string = Daemon.DEFAULT_GROUP , meta: any={}): Promise<DaemonProcessState> {
        Logger.info('Starting daemon, group: %s, title: %s, content: %s, meta: %j', group, title, contentType, meta);
        const key: string = this.generateKey(group);
        const now: number = new Date().getTime();

        const newState: DaemonProcessState = {
            id: key,

            title: title,
            lastUpdatedEpochMS: now,
            lastUpdatedMessage: 'Created',

            startedEpochMS: now,
            completedEpochMS: null,
            meta: meta,
            error: null,
            link: null,
            contentType: contentType
        } as DaemonProcessState;

        return this.writeStat(newState);
    }

    private async writeStat(newState: DaemonProcessState, contents: Buffer = Buffer.from(Daemon.DEFAULT_CONTENT)): Promise<DaemonProcessState> {
        const s3meta: any = {};
        newState.lastUpdatedEpochMS = new Date().getTime();
        s3meta[Daemon.DAEMON_METADATA_KEY] = JSON.stringify(newState);

        const params = {
            Bucket: this.bucket,
            Key: newState.id,
            ContentType: newState.contentType,
            Metadata: s3meta,
            Body: contents
        };

        const written = await this.s3.putObject(params).promise();
        Logger.silly('Daemon wrote : %s', written);
        return this.stat(newState.id);
    }

    public async list(group: string = Daemon.DEFAULT_GROUP, date: Date = new Date()): Promise<string[]> {
        return this.cache.directChildrenOfPrefix(this.generatePrefix(group, date));
    }

    public async updateMessage(id:string, newMessage: string): Promise<DaemonProcessState> {
        const inStat: DaemonProcessState = await this.stat(id);
        inStat.lastUpdatedMessage = newMessage;
        return this.writeStat(inStat);
    }

    public async stat(id:string): Promise<DaemonProcessState> {
        let stat: DaemonProcessState = null;

        const meta: any = await this.cache.fetchMetaForCacheFile(id);
        Logger.debug('Daemon: Meta is %j', meta);
        const metaString: string = (meta && meta['Metadata']) ? meta['Metadata'][Daemon.DAEMON_METADATA_KEY] : null;
        if (metaString) {
            stat = JSON.parse(metaString) as DaemonProcessState;
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
        return this.writeStat(inStat);
    }

    public async finalize(id:string, contents: Buffer): Promise<DaemonProcessState> {
        const inStat: DaemonProcessState = await this.stat(id);
        inStat.completedEpochMS = new Date().getTime();
        return this.writeStat(inStat, contents);
    }

}
