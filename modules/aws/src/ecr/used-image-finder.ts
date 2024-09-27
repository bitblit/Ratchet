/**
 * Classes implementing this interface are able to find image ids that are currently in use
 */
export interface UsedImageFinder {
  findUsedImageUris(): Promise<string[]>;
}
