import { StackProps } from 'aws-cdk-lib';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { EpsilonApiStackFeature } from './epsilon-api-stack-feature.js';
import { SubnetAttributes } from "aws-cdk-lib/aws-ec2";

export interface EpsilonApiStackProps extends StackProps {
  batchInstancesEc2KeyPairName?: string;
  additionalPolicyStatements: PolicyStatement[];

  disabledFeatures?: EpsilonApiStackFeature[];

  dockerFileFolder: string;
  dockerFileName: string;

  lambdaSecurityGroupIds: string[];
  vpcSubnetAttributes: SubnetAttributes[];
  vpcId: string;

  extraEnvironmentalVars?: Record<string, string>;
  webLambdaPingMinutes?: number;

  webMemorySizeMb?: number;
  backgroundMemorySizeMb?: number;

  webTimeoutSeconds?: number;
  backgroundTimeoutSeconds?: number;

  replaceBatchComputeEnvironment?: boolean;
}
