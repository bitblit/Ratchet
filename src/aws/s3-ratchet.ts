import {Logger} from '../common/logger';
import {RequireRatchet} from '../common/require-ratchet';

export class S3Ratchet {
  // Here because the native AWS SDK doesn't support promises for this operation as of 2019-04-21
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public static async createPresignedUrl(s3: AWS.S3, operation: string, params: any): Promise<string> {
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

  // Returns whether the URL passed is s3 valid (not whether it exists or not)
  public static checkS3UrlForValidity(value: string): boolean {
    let rval: boolean = false;
    if (value) {
      rval = value.startsWith('s3://') && value.trim().length > 5;
    }
    return rval;
  }

  public static extractBucketFromURL(value: string): string {
    RequireRatchet.true(S3Ratchet.checkS3UrlForValidity(value), 'invalid s3 url');
    const idx1: number = value.indexOf('/', 5);
    const rval: string = idx1 > 0 ? value.substring(5, idx1) : value.substring(5);
    return rval;
  }

  public static extractKeyFromURL(value: string): string {
    RequireRatchet.true(S3Ratchet.checkS3UrlForValidity(value), 'invalid s3 url');
    const idx1: number = value.indexOf('/', 5);
    const rval: string = idx1 > 0 ? value.substring(idx1 + 1) : null;
    return rval;
  }
}
