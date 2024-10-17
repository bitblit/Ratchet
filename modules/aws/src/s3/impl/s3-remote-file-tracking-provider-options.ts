import { S3CacheRatchetLike } from "../s3-cache-ratchet-like.js";

// For future configuration
export interface S3RemoteFileTrackingProviderOptions {
  s3CacheRatchet: S3CacheRatchetLike;
}
