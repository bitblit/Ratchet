import { Logger } from '@bitblit/ratchet-common';
import { EcrUnusedImageCleaner } from './ecr-unused-image-cleaner';
import { ECRClient } from '@aws-sdk/client-ecr';
import { AwsCredentialsRatchet } from '../iam/aws-credentials-ratchet';
import { LambdaUsedImageFinder } from './used-image-finders/lambda-used-image-finder';
import { LambdaClient } from '@aws-sdk/client-lambda';
import { AwsBatchUsedImageFinder } from './used-image-finders/aws-batch-used-image-finder';
import { BatchClient } from '@aws-sdk/client-batch';
import { EcrUnusedImageCleanerOutput } from './ecr-unused-image-cleaner-output';

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

  it('should run the cleaner', async () => {
    Logger.info('Testing cleaner');
    AwsCredentialsRatchet.applySetProfileEnvironmentalVariable('pluma');
    const cleaner: EcrUnusedImageCleaner = new EcrUnusedImageCleaner(new ECRClient({ region: 'us-east-1' }));
    const output: EcrUnusedImageCleanerOutput = await cleaner.performCleaning({
      dryRun: false,
      usedImageFinders: [
        new LambdaUsedImageFinder(new LambdaClient({ region: 'us-east-1' })),
        new AwsBatchUsedImageFinder(new BatchClient({ region: 'us-east-1' })),
      ],
    });
    expect(output).not.toBeNull();
  }, 300_000_000);
});
