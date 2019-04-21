import {Logger} from '../common/logger';

export class S3Ratchet {

    // Here because the native AWS SDK doesn't support promises for this operation as of 2019-04-21
    public static async createPresignedUrl(s3:AWS.S3, operation: string, params: any): Promise<string> {
        // the .promise() isn't supported as of this version of the sdk (2018-07)
        return new Promise<string>((res, rej) => {
            return s3.getSignedUrl(operation, params, (err, result) => {
                if (err) {
                    Logger.warn('Failed to generate link : %s', err);
                    rej(err);
                }
                Logger.silly('Returning %s', result);
                res(result);
            });
        });
    }


}