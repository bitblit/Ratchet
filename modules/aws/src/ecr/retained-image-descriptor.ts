import { ImageDetail } from '@aws-sdk/client-ecr';
import { RetainedImageReason } from './retained-image-reason.js';

export interface RetainedImageDescriptor {
  image: ImageDetail;
  reason: RetainedImageReason;
}
