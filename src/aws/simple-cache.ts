/*
    Wraps up the job of caching objects to S3 and doing simple read-thru caching

    T is the type of object cached
    R is the type of object passed to the create process.  Could just be a string or something
    more complicated, but has to be resolvable to a s3 path
*/

import {S3CacheRatchet} from './s3-cache-ratchet';
import {CacheObjectProducer} from './model/cache-object-producer';
import {Logger} from '../common/logger';

export class SimpleCache<T, R> {

    constructor(private s3CacheRatchet: S3CacheRatchet, private cacheObjectProducer: CacheObjectProducer<T, R>) {
    }

    public async fetch(key: R, maxStalenessSeconds?: number): Promise<T> {
        const path = this.cacheObjectProducer.keyToPath(key);
        let useCache: boolean = true;
        let rval: T = null;
        if (maxStalenessSeconds) {
            const age: number = await this.s3CacheRatchet.cacheFileAgeInSeconds(path);
            useCache = age < maxStalenessSeconds;
        }
        if (useCache) {
            rval = await this.s3CacheRatchet.readCacheFileToObject(path) as T;
        }
        if (!rval) {
            Logger.debug('Cache file %s is missing or too old - generating');
            rval = await this.update(key);
        }
        return rval;
    }

    public async update(key: R): Promise<T> {
        const path: string = this.cacheObjectProducer.keyToPath(key);
        Logger.info('Generating new value for %j to %s', key, path);
        const newOb: T = await this.cacheObjectProducer.generate(key);
        const written: any = await this.s3CacheRatchet.writeObjectToCacheFile(path, newOb);
        Logger.info('Written - returning new value');
        return written;
    }

    public async clear(key: R): Promise<boolean> {
        try {
            const path: string = this.cacheObjectProducer.keyToPath(key);
            Logger.info('Clearing cache object for %j at %s', key, path);
            const del: any = this.s3CacheRatchet.removeCacheFile(path);
            return true;
        } catch (err) {
            Logger.warn('Failed to delete cache file : %s', err, err);
            return false;
        }
    }

}