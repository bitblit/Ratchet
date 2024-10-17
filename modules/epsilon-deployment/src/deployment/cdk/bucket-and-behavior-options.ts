import { IBucket } from "aws-cdk-lib/aws-s3";
import { BehaviorOptions } from "aws-cdk-lib/aws-cloudfront";

export interface BucketAndBehaviorOptions {
  bucket: IBucket;
  behaviorOptions: BehaviorOptions;
}
