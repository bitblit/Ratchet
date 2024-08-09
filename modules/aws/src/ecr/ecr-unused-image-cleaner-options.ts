import { UsedImageFinder } from './used-image-finder.js';

export interface EcrUnusedImageCleanerOptions {
  usedImageFinders: UsedImageFinder[]; // List of objects that will find in-use images that should not be removed

  dryRun?: boolean;
  repositoriesToPurge?: string[]; // If set, only process these repos
  minimumAgeInDays?: number; // If set, don't remove anything younger than this
}
