import { RequireRatchet } from '@bitblit/ratchet-common';
import { injectable } from "tsyringe";

@injectable()
export class S3Ratchet {
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
