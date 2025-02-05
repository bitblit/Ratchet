import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { EcrUnusedImageCleaner } from './ecr-unused-image-cleaner.js';
import { ECRClient } from '@aws-sdk/client-ecr';
import { AwsCredentialsRatchet } from '../iam/aws-credentials-ratchet.js';
import { LambdaUsedImageFinder } from './used-image-finders/lambda-used-image-finder.js';
import { LambdaClient } from '@aws-sdk/client-lambda';
import { AwsBatchUsedImageFinder } from './used-image-finders/aws-batch-used-image-finder.js';
import { BatchClient } from '@aws-sdk/client-batch';
import { EcrUnusedImageCleanerOutput } from './ecr-unused-image-cleaner-output.js';
import { describe, expect, test } from 'vitest';

//import { mockClient } from 'aws-sdk-client-mock';
//import { ECRClient } from "@aws-sdk/client-ecr";

//let mockEcr;

describe('#ecrUnusedImageCleaner', function () {
  /*
  mockEcr = mockClient(ECRClient);

  beforeEach(() => {
    mockEcr.reset();
  });

   */

  test.skip('should run the cleaner', async () => {
    Logger.info('Testing cleaner');
    AwsCredentialsRatchet.applySetProfileEnvironmentalVariable('your-profile-here');
    const cleaner: EcrUnusedImageCleaner = new EcrUnusedImageCleaner(new ECRClient({ region: 'us-east-1' }));
    const output: EcrUnusedImageCleanerOutput = await cleaner.performCleaning({
      dryRun: true,
      usedImageFinders: [
        new LambdaUsedImageFinder(new LambdaClient({ region: 'us-east-1' })),
        new AwsBatchUsedImageFinder(new BatchClient({ region: 'us-east-1' })),
      ],
    });
    expect(output).not.toBeNull();
  }, 300_000_000);
});
