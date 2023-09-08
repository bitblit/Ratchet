import { StackProps } from 'aws-cdk-lib';
import { SimpleAdditionalS3WebsiteMapping } from './simple-additional-s3-website-mapping.js';
import { EpsilonLambdaToCloudfrontPathMapping } from './epsilon-lambda-to-cloudfront-path-mapping.js';

export interface EpsilonWebsiteStackProps extends StackProps {
  targetBucketName: string;
  cloudFrontHttpsCertificateArn: string;
  cloudFrontDomainNames: string[];
  apiMappings: EpsilonLambdaToCloudfrontPathMapping;
  pathsToAssets: string[];
  route53Handling: EpsilonWebsiteStackPropsRoute53Handling;
  simpleAdditionalMappings?: SimpleAdditionalS3WebsiteMapping[];
}

export enum EpsilonWebsiteStackPropsRoute53Handling {
  Update = 'Update',
  DoNotUpdate = 'DoNotUpdate',
}
