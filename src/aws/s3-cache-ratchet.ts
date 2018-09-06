
/*
    Wrap S3 with an ability to store and retrieve objects cached as json files
*/


import * as AWS from "aws-sdk";
import moment = require("moment");
import {Logger} from "../common/logger";

export class S3CacheRatchet {
    private s3:AWS.S3;
    private defaultBucket : string;

    constructor(s3: AWS.S3, defaultBucket:string = null)
    {
        if (!s3)
        {
            throw ("S3 may not be null");
        }
        this.s3 = s3;
        this.defaultBucket = defaultBucket;
    }

    private bucketVal(explicitBucket:string) : string{
        let rval : string = (explicitBucket)?explicitBucket:this.defaultBucket;
        if (!rval)
        {
            throw "You must set either the default bucket or pass it explicitly";
        }
        return rval;
    }

    public readCacheFileToString(key:string, bucket:string = null) : Promise<string>
    {
        const params = {
            Bucket: this.bucketVal(bucket),
            Key: key
        };

        return this.s3.getObject(params).promise().then(res => {
            if (res && res.Body) {
                return res.Body.toString();
            } else {
                Logger.warn('Could not find cache file : %s / %s', bucket, key);
                return null;
            }
        }).catch(err => {
            if (err && err.statusCode === 404) {
                Logger.warn('Cache file %s %s not found returning null', bucket, key);
                return null;
            } else {
                throw err;
            }

        });
    }


    public readCacheFileToObject<T>(key:string, bucket:string = null) : Promise<T>
    {
        return this.readCacheFileToString(key, bucket).then(value => {
            return (value)?JSON.parse(value) as T:null;
        });
    }

    public removeCacheFile(key:string, bucket:string = null) : Promise<any>
    {
        let params = {
            Bucket: this.bucketVal(bucket),
            Key: key
        };

        return this.s3.deleteObject(params).promise().then(res=>{
            return res;
        }).catch(err=>{
            if (err && err.statusCode==404)
            {
                Logger.info("Swallowing 404 deleting missing object %s %s", bucket, key);
                return null;
            }
            else
            {
                throw err;
            }
        })
    }


    // Given new board data, write it to the S3 file and set the refresh flag appropriately
    public writeObjectToCacheFile(key:string, dataObject:any, bucket:string = null, meta: any = {},
                                         cacheControl: string='max-age=30', contentType : string='application/json') : Promise<any>
    {
        let json = JSON.stringify(dataObject);

        let params = {
            Bucket: this.bucketVal(bucket),
            Key: key,
            Body: json,
            CacheControl:cacheControl,
            ContentType:contentType,
            Metadata:meta,
        };

        return this.s3.putObject(params).promise();
    }

    public fetchMetaForCacheFile(key:string, bucket:string = null): Promise<any>
    {
        return this.s3.headObject({Bucket:this.bucketVal(bucket), Key:key}).promise();
    }

    public cacheFileAgeInSeconds(key:string, bucket:string = null): Promise<number>
    {
        return this.s3.headObject({Bucket:this.bucketVal(bucket), Key:key}).promise().then(res=>{
            if (res && res.LastModified)
            {
                let mom = moment(res.LastModified);
                return moment().unix()-mom.unix();
            }
            else
            {
                Logger.warn("Cache file %s %s had no last modified returning null", this.bucketVal(bucket), key);
                return null;
            }
        }).catch(err=>{
            if (err && err.statusCode==404)
            {
                Logger.warn("Cache file %s %s not found returning null", this.bucketVal(bucket), key);
                return null;
            }
            else
            {
                throw err;
            }
        })
    }


    public createDownloadLink(key:string, secondsUntilExpiration:number=3600, bucket:string = null):  string // URL
    {
        let params = {Bucket: this.bucketVal(bucket), Key: key, ExpiresIn: secondsUntilExpiration};
        let url = this.s3.getSignedUrl('getObject', params);
        return url;
    }

    public  directChildrenOfPrefix(prefix:string, expandFiles:boolean=false, bucket:string = null ) : Promise<string[]> {
        let returnValue = [];

        let params = {
            Bucket: this.bucketVal(bucket), Prefix: prefix, Delimiter: '/'
        };

        return this.s3.listObjects(params).promise().then(response => {
            let prefixLength = prefix.length;
            // Process directories
            if (response['CommonPrefixes']) {
                response['CommonPrefixes'].forEach(cp => {
                    let value = cp['Prefix'].substring(prefixLength);
                    returnValue.push(value);

                });
            }

            // Process files
            if (response['Contents']) {
                response['Contents'].forEach(cp => {
                    if (expandFiles) {
                        let expanded = {
                            'link': this.createDownloadLink(cp['Key'], 3600, bucket),
                            'name': cp['Key'].substring(prefixLength),
                            'size': cp['Size']
                        };
                        returnValue.push(expanded);
                    }
                    else {
                        returnValue.push(cp['Key'].substring(prefixLength))
                    }
                });
                // TODO: Need to handle large batches that need pagination
            }
            return returnValue;
        });
    }


}