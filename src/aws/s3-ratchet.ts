import { RequireRatchet } from '../common/require-ratchet';

export class S3Ratchet {
  // Here because the native AWS SDK did not USED to have this function.  It
  // Does now, so this is just a pass-thru for backwards compatibility
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public static async createPresignedUrl(s3: AWS.S3, operation: string, params: any): Promise<string> {
    return s3.getSignedUrlPromise(operation, params);
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
