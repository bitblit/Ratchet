import { ImageDetail, Repository } from '@aws-sdk/client-ecr';
import { RetainedImageDescriptor } from './retained-image-descriptor.js';

export interface EcrUnusedImageCleanerRepositoryOutput {
  repository: Repository;
  purged: ImageDetail[];
  retained: RetainedImageDescriptor[];

  totalBytesRecovered: number;
}
