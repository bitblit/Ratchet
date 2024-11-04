import { StackProps } from 'aws-cdk-lib';
import { SimpleAdditionalS3WebsiteMapping } from './simple-additional-s3-website-mapping.js';
import { EpsilonLambdaToCloudfrontPathMapping } from './epsilon-lambda-to-cloudfront-path-mapping.js';
import { Behavior } from 'aws-cdk-lib/aws-cloudfront';
import { EpsilonWebsiteCacheBehavior } from './epsilon-website-cache-behavior.js';
import { EpsilonRoute53Handling } from './epsilon-route-53-handling.js';

export interface EpsilonWebsiteStackProps extends StackProps {
  targetBucketName: string;
  cloudFrontHttpsCertificateArn: string;
  cloudFrontDomainNames: string[];
  apiMappings: EpsilonLambdaToCloudfrontPathMapping[];
  pathsToAssets: string[];
  route53Handling: EpsilonRoute53Handling;
  simpleAdditionalMappings?: SimpleAdditionalS3WebsiteMapping[];
  websiteCacheBehavior?: EpsilonWebsiteCacheBehavior;
  websiteBehaviorOverride?: Behavior[];
  retainWebsiteBucketOnDestroy?: boolean;
}
