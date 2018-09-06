
/*
    Wrap S3 with an ability to store and retrieve objects cached as json files
*/

export interface CacheObjectProducer<T,R> {

    keyToPath(key: R) : string;
    generate(key: R) : Promise<T>;

}