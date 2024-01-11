export interface EcrRepositoryPruneConfig {
  repositoriesToPurge: string[];
  batchDeleteSize?: number;
  minimumAgeInDays?: number; // Do not delete images that are not at least this many days old.
  minimumImageCount?: number; // Do not delete images if it would bring the total image count below this number.
  dryRun?: boolean;
}
