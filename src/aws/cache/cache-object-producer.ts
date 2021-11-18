/*
    Objects implementing this interface can producer objects that are then cached in S3 (or elsewhere I suppose)
    These objects are consumed by SimpleCache

    T is the type of object cached
    R is the type of object passed to the create process.  Could just be a string or something
*/

export interface CacheObjectProducer<T, R> {
  keyToPath(key: R): string;

  generate(key: R): Promise<T>;
}
