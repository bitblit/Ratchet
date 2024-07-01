import { IBucket } from "aws-cdk-lib/aws-s3";
import { SourceConfiguration } from "aws-cdk-lib/aws-cloudfront";

export interface BucketAndSourceConfiguration {
  bucket: IBucket;
  sourceConfig: SourceConfiguration;
}
