import { EcrUnusedImageCleanerRepositoryOutput } from './ecr-unused-image-cleaner-repository-output.js';
import { EcrUnusedImageCleanerOptions } from './ecr-unused-image-cleaner-options.js';

export interface EcrUnusedImageCleanerOutput {
  registryId: string;
  repositories: EcrUnusedImageCleanerRepositoryOutput[];
  options: EcrUnusedImageCleanerOptions;
}
