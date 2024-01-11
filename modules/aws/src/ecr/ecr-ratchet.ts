import {
  BatchDeleteImageCommand,
  DescribeImagesCommand,
  DescribeImagesResponse,
  DescribeRegistryCommand,
  DescribeRegistryResponse,
  ECRClient,
  ImageDetail,
  ImageIdentifier,
} from '@aws-sdk/client-ecr';
import _ from 'lodash';
import { EcrRepositoryPruneConfig } from './ecr-repository-prune-config';
import { Logger, RequireRatchet } from '@bitblit/ratchet-common';

export class EcrRatchet {
  private static readonly ECR_REPOSITORIES_TO_PRUNE_ENV_KEY: string = 'NEON_ECR_REPOSITORIES_TO_PRUNE';

  private static readonly AWS_ECR_BATCH_DELETE_IMAGE_COUNT: number = 100;

  // Do not delete images that are not at least this many days old.
  private static readonly ECR_IMAGE_MINIMUM_AGE_DAYS: number = 60;

  // Do not delete images if it would bring the total image count below this number.
  private static readonly ECR_REPOSITORY_MINIMUM_IMAGE_COUNT: number = 600;

  constructor(private ecr: ECRClient) {
    RequireRatchet.notNullOrUndefined(ecr, 'ecr');
  }

  public async fetchRepositoryNames(): Promise<string[]> {
    return null;
  }

  private async fetchRegistryId(): Promise<string> {
    const response: DescribeRegistryResponse = await this.ecr.send(new DescribeRegistryCommand({}));
    return response.registryId;
  }

  private async handlePruning(cfg: EcrRepositoryPruneConfig): Promise<ImageIdentifier[]> {
    const registryId: string = await this.fetchRegistryId();
    const rval: ImageIdentifier[] = await this.handlePruningForRegistry(registryId, cfg);
    return rval;
  }

  private async handlePruningForRegistry(registryId: string, cfg: EcrRepositoryPruneConfig): Promise<ImageIdentifier[]> {
    let rval: ImageIdentifier[] = [];
    const minAgeInDays: number = RequireRatchet.isNullOrUndefined(cfg.minimumAgeInDays) ? 60 : cfg.minimumAgeInDays;
    const minimumImageCount: number = RequireRatchet.isNullOrUndefined(cfg.minimumImageCount) ? 600 : cfg.minimumImageCount;
    const batchDeleteSize: number = cfg.batchDeleteSize || 100; // Cannot allow 0 here

    for (let j = 0; j < cfg.repositoriesToPurge.length; j++) {
      const repositoryName: string = cfg.repositoriesToPurge[j];
      const imageArray: ImageDetail[] = [];
      let nextToken: string | undefined;
      do {
        if (nextToken) {
          Logger.info(`Fetching images for ${repositoryName} (from ${imageArray.length})...`);
        }
        const response: DescribeImagesResponse = await this.ecr.send(
          new DescribeImagesCommand({ registryId, repositoryName, nextToken, maxResults: 1_000 }),
        );
        nextToken = response.nextToken;

        imageArray.push(...response.imageDetails);
      } while (nextToken !== undefined);

      Logger.info(`Found ${imageArray.length} image(s) for ${repositoryName}`);

      // Sort it so the oldest images are first.
      imageArray.sort((a, b) => (a.imagePushedAt > b.imagePushedAt ? 1 : -1));

      const maximumCreationEpochMS: number = Date.now() - minAgeInDays * 24 * 60 * 60 * 1_000;

      const maximumCreateDateHourUtc: string = SharedDateUtil.epochMSToDateHourUtc(maximumCreationEpochMS);
      Logger.info(`Maximum allowed creation date for pruning: ~${maximumCreateDateHourUtc}`);

      const imageDigestsToPrune: ImageIdentifier[] = [];

      for (const eachImage of imageArray) {
        if (eachImage.imagePushedAt.getTime() > maximumCreationEpochMS) {
          // They're sorted by pushed date, so the first one we find that is past our allowed timestamp,
          // we can break. All the others will be newer.
          Logger.info(`Image is too recently pushed ${eachImage.imagePushedAt}. Finished selecting for pruning.`);
          break;
        } else if (imageArray.length - imageDigestsToPrune.length <= minimumImageCount) {
          // The image count is already at the minimum. We can't prune any more.
          Logger.info(`Reached minimum image count. Finished selecting for pruning.`);
          break;
        }

        imageDigestsToPrune.push({
          imageDigest: eachImage.imageDigest,
        });
        Logger.info(`Adding to prune list: ${eachImage.imageDigest} (${eachImage.imagePushedAt})`);
      }

      const imageDigestsToPruneChunks: ImageIdentifier[][] = _.chunk(imageDigestsToPrune, batchDeleteSize);

      Logger.info(`Got ${imageDigestsToPruneChunks.length} chunks of images to delete.`);

      let i: number = 0;
      rval = rval.concat(imageDigestsToPrune);
      if (cfg.dryRun) {
        Logger.info('DryRun specified : Would have purged %j', imageDigestsToPrune);
      } else {
        while (i < imageDigestsToPruneChunks.length) {
          const eachImageDigestChunk: ImageIdentifier[] = imageDigestsToPruneChunks[i];
          Logger.info(`Deleting chunk: ${i + 1}/${imageDigestsToPruneChunks.length} (${eachImageDigestChunk.length} image(s))`);
          await this.ecr.send(new BatchDeleteImageCommand({ registryId, repositoryName, imageIds: eachImageDigestChunk }));
          i++;
        }
      }

      Logger.info(`Finished deleting all chunks for ${repositoryName}`);
    }
    return rval;
  }
}
