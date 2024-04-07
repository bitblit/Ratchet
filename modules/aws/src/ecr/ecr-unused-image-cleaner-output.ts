import { EcrUnusedImageCleanerRepositoryOutput } from './ecr-unused-image-cleaner-repository-output';
import { EcrUnusedImageCleanerOptions } from './ecr-unused-image-cleaner-options';

export interface EcrUnusedImageCleanerOutput {
  registryId: string;
  repositories: EcrUnusedImageCleanerRepositoryOutput[];
  options: EcrUnusedImageCleanerOptions;
}
