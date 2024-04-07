import { UsedImageFinder } from './used-image-finder';
import { ImageDetail } from '@aws-sdk/client-ecr';

export enum RetainedImageReason {
  InUse = 'InUse',
  MinimumAge = 'MinimumAge',
}
