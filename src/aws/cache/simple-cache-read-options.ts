/*
    Controls how the object will be read from cache
*/

export interface SimpleCacheReadOptions {
  maxStalenessMS: number;
  timeToLiveMS: number;
  cacheNullValues: boolean;
}
