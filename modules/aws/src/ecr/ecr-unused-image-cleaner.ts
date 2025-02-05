import {
  BatchDeleteImageCommand,
  BatchDeleteImageCommandInput,
  BatchDeleteImageCommandOutput,
  DescribeImagesCommand,
  DescribeImagesCommandInput,
  DescribeImagesResponse,
  DescribeRegistryCommand,
  DescribeRegistryResponse,
  DescribeRepositoriesCommand,
  DescribeRepositoriesCommandInput,
  DescribeRepositoriesResponse,
  ECRClient,
  ImageDetail,
  Repository,
} from '@aws-sdk/client-ecr';
import { RequireRatchet } from '@bitblit/ratchet-common/lang/require-ratchet';
import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { StringRatchet } from '@bitblit/ratchet-common/lang/string-ratchet';
import { EcrUnusedImageCleanerOptions } from './ecr-unused-image-cleaner-options.js';
import { UsedImageFinder } from './used-image-finder.js';
import { EcrUnusedImageCleanerRepositoryOutput } from './ecr-unused-image-cleaner-repository-output.js';
import { RetainedImageDescriptor } from './retained-image-descriptor.js';
import { RetainedImageReason } from './retained-image-reason.js';
import { EcrUnusedImageCleanerOutput } from './ecr-unused-image-cleaner-output.js';

export class EcrUnusedImageCleaner {
  // Do not delete images that are not at least this many days old.
  private static readonly ECR_IMAGE_MINIMUM_AGE_DAYS: number = 60;

  // Do not delete images if it would bring the total image count below this number.
  private static readonly ECR_REPOSITORY_MINIMUM_IMAGE_COUNT: number = 600;

  constructor(private ecr: ECRClient) {
    RequireRatchet.notNullOrUndefined(ecr, 'ecr');
  }

  public async findAllUsedImages(finders: UsedImageFinder[]): Promise<string[]> {
    const rval: Set<string> = new Set<string>();
    for (const fnd of finders) {
      //for (let i = 0; i < finders.length; i++) {
      const next: string[] = await fnd.findUsedImageUris();
      next.forEach((s) => rval.add(s));
    }
    return Array.from(rval);
  }

  public async performCleaning(opts: EcrUnusedImageCleanerOptions): Promise<EcrUnusedImageCleanerOutput> {
    Logger.info('Starting cleaning with options : %j', opts);

    Logger.info('Finding in-use images');
    const usedImagesUris: string[] = await this.findAllUsedImages(opts.usedImageFinders || []);
    const usedImageTags: string[] = usedImagesUris.map((s) => s.substring(s.lastIndexOf(':') + 1));
    Logger.info('Found %d images in use: %j', usedImageTags.length, usedImageTags);

    const regId: string = await this.fetchRegistryId();
    Logger.info('Processing registry %s', regId);
    const repos: Repository[] = await this.fetchAllRepositoryDescriptors(regId);
    Logger.info('Found repos : %j', repos);

    const cleaned: EcrUnusedImageCleanerRepositoryOutput[] = [];
    for (let i = 0; i < repos.length; i++) {
      Logger.info('Processing repo %d of %d', i, repos.length);
      try {
        const next = await this.cleanRepository(repos[i], usedImageTags, opts);
        cleaned.push(next);
      } catch (err) {
        Logger.error('Failed to process repo : %j : %s', repos[i], err, err);
      }
    }

    const rval: EcrUnusedImageCleanerOutput = {
      registryId: regId,
      repositories: cleaned,
      options: opts,
    };
    return rval;
  }

  public async cleanRepository(
    repo: Repository,
    usedImageTags: string[],
    opts: EcrUnusedImageCleanerOptions,
  ): Promise<EcrUnusedImageCleanerRepositoryOutput> {
    Logger.info('Cleaning repository: %j', repo);

    const images: ImageDetail[] = await this.fetchAllImageDescriptors(repo);
    Logger.info('Found images: %d : %j', images.length, images);

    const toPurge: ImageDetail[] = [];
    const toKeep: RetainedImageDescriptor[] = [];
    images.forEach((i) => {
      const matches: boolean[] = usedImageTags.map((tag) => i.imageTags.includes(tag));
      const anyMatch: boolean = matches.find((s) => s);
      if (anyMatch) {
        toKeep.push({ image: i, reason: RetainedImageReason.InUse });
      } else {
        toPurge.push(i);
      }
    });

    Logger.info('Found %d to purge and %d to keep', toPurge.length, toKeep.length);

    const totalBytes: number = toPurge.map((p) => p.imageSizeInBytes).reduce((a, i) => a + i, 0);
    Logger.info('Found %s total bytes to purge : %d', StringRatchet.formatBytes(totalBytes), totalBytes);

    const purgeCmd: BatchDeleteImageCommandInput = {
      registryId: repo.registryId,
      repositoryName: repo.repositoryName,
      imageIds: toPurge.map((p) => {
        return { imageDigest: p.imageDigest, imageTag: p.imageTags[0] };
      }),
    };

    Logger.info('Purge command : %j', purgeCmd);

    if (opts.dryRun) {
      Logger.info('Dry run specd, stopping');
    } else {
      if (purgeCmd.imageIds.length > 0) {
        Logger.info('Purging unused images');
        const output: BatchDeleteImageCommandOutput = await this.ecr.send(new BatchDeleteImageCommand(purgeCmd));
        Logger.info('Response was : %j', output);
      } else {
        Logger.info('Skipping - nothing to purge in this repo');
      }
    }

    const rval: EcrUnusedImageCleanerRepositoryOutput = {
      repository: repo,
      purged: toPurge,
      retained: toKeep,

      totalBytesRecovered: totalBytes,
    };
    return rval;
  }

  public async fetchAllImageDescriptors(repo: Repository): Promise<ImageDetail[]> {
    RequireRatchet.notNullOrUndefined(repo, 'repo');
    let rval: ImageDetail[] = [];
    const cmd: DescribeImagesCommandInput = {
      registryId: repo.registryId,
      repositoryName: repo.repositoryName,
    };
    let resp: DescribeImagesResponse = null;

    do {
      resp = await this.ecr.send(new DescribeImagesCommand(cmd));
      rval = rval.concat(resp.imageDetails);
      cmd.nextToken = resp.nextToken;
    } while (StringRatchet.trimToNull(cmd.nextToken));

    return rval;
  }

  public async fetchAllRepositoryDescriptors(registryId: string): Promise<Repository[]> {
    let rval: Repository[] = [];
    const cmd: DescribeRepositoriesCommandInput = {
      registryId: registryId,
    };
    let resp: DescribeRepositoriesResponse = null;

    do {
      resp = await this.ecr.send(new DescribeRepositoriesCommand(cmd));
      rval = rval.concat(resp.repositories);
      cmd.nextToken = resp.nextToken;
    } while (StringRatchet.trimToNull(cmd.nextToken));

    return rval;
  }

  public async fetchAllRepositoryNames(registryId: string): Promise<string[]> {
    const resps: Repository[] = await this.fetchAllRepositoryDescriptors(registryId);
    const rval: string[] = resps.map((r) => r.repositoryName);
    return rval;
  }

  private async fetchRegistryId(): Promise<string> {
    const response: DescribeRegistryResponse = await this.ecr.send(new DescribeRegistryCommand({}));
    return response.registryId;
  }
}
