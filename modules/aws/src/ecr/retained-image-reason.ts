import { UsedImageFinder } from './used-image-finder.js';
import { ImageDetail } from '@aws-sdk/client-ecr';

export enum RetainedImageReason {
  InUse = 'InUse',
  MinimumAge = 'MinimumAge',
}
