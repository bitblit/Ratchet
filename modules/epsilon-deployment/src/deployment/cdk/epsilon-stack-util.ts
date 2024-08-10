import { Logger } from "@bitblit/ratchet-common/logger/logger";
import { StringRatchet } from "@bitblit/ratchet-common/lang/string-ratchet";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Topic } from "aws-cdk-lib/aws-sns";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { EpsilonApiStackProps } from "./epsilon-api-stack-props.js";

export class EpsilonStackUtil {
  // Prevent instantiation
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static toEnvironmentVariables(input: Record<string, any>[]): Record<string, string> {
    const rval: Record<string, string> = {};
    input.forEach((inval) => {
      Object.keys(inval).forEach((k) => {
        rval[k] = StringRatchet.safeString(inval[k]);
      });
    });

    return rval;
  }

  public static createDefaultPolicyStatementList(
    props: EpsilonApiStackProps,
    backgroundLambdaSqs: Queue,
    backgroundLambdaSns: Topic,
    interApiSns: Topic
  ): PolicyStatement[] {
    const rval: PolicyStatement[] = (props.additionalPolicyStatements || []).concat([
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'],
        resources: ['arn:aws:logs:*:*:*'],
      }),
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['ses:SendEmail', 'ses:SendRawEmail'],
        resources: ['arn:aws:ses:*'],
      }),
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['sqs:*'],
        resources: [backgroundLambdaSqs.queueArn],
      }),
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['sns:*'],
        resources: [backgroundLambdaSns.topicArn, interApiSns.topicArn],
      }),
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['batch:*'],
        resources: ['*'],
      }),
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['ec2:DescribeSecurityGroups'],
        resources: ['*'],
      }),
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['ec2:DescribeSubnets'],
        resources: ['*'],
      }),
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['ec2:DescribeVpcs'],
        resources: ['*'],
      }),
    ]);
    Logger.info('Created policy statement list: %j', rval);
    return rval;
  }

  public static readonly ALLOW_ECS: PolicyStatement = new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ['ecs:*'],
    resources: ['*'],
  });

  public static readonly ALLOW_ECR: PolicyStatement = new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ['ecr:BatchCheckLayerAvailability', 'ecr:BatchGetImage', 'ecr:GetDownloadUrlForLayer', 'ecr:GetAuthorizationToken'],
    resources: ['*'],
  });

  public static readonly ALLOW_RESTRICTED_LOGS: PolicyStatement = new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ['logs:CreateLogStream', 'logs:PutLogEvents', 'logs:DescribeLogStreams', 'logs:CreateLogGroup'],
    resources: ['*'],
  });

  // Used by fargate to read containers, etc
  public static readonly ALLOW_FARGATE_SECRET_READING: PolicyStatement[] = [
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['ssm:GetParameters'],
      resources: ['*'],
    }),
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['secretsmanager:GetSecretValue'],
      resources: ['*'],
    }),
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['kms:Decrypt'],
      resources: ['*'],
    }),
  ];

  public static readonly ECS_POLICY_STATEMENTS: PolicyStatement[] = [
    EpsilonStackUtil.ALLOW_ECS,
    EpsilonStackUtil.ALLOW_ECR,
    EpsilonStackUtil.ALLOW_RESTRICTED_LOGS,
  ].concat(EpsilonStackUtil.ALLOW_FARGATE_SECRET_READING);
}
