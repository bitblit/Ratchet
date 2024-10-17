import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { StringRatchet } from '@bitblit/ratchet-common/lang/string-ratchet';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { EpsilonApiStackProps } from './epsilon-api-stack-props.js';
import { ErrorRatchet } from "@bitblit/ratchet-common/lang/error-ratchet";
import { HeadersFrameOption, HeadersReferrerPolicy, ResponseHeadersPolicy } from "aws-cdk-lib/aws-cloudfront";
import { Construct } from "constructs";
import { Duration } from "aws-cdk-lib";

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
    interApiSns: Topic,
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


  public static extractApexDomain(domainName: string): string {
    const pieces: string[] = StringRatchet.trimToEmpty(domainName).split('.');
    if (pieces.length < 2) {
      ErrorRatchet.throwFormattedErr('Not a valid domain name : %s', domainName);
    }
    return pieces[pieces.length - 2] + '.' + pieces[pieces.length - 1];
  }

  public static createForwardCorsPolicy(app: Construct, id: string, xssReportUri: string): ResponseHeadersPolicy {
    // Creating a custom response headers policy -- all parameters optional
    const rval: ResponseHeadersPolicy = new ResponseHeadersPolicy(app, id+'CFRespHeadersPolicy', {
      responseHeadersPolicyName: id+'CustomCloudfrontPolicy',
      comment: 'Policy allowing passthru for CORS headers',
      corsBehavior:
        {
        accessControlAllowCredentials: false,
        accessControlAllowHeaders: ['*'],
        accessControlAllowMethods: ['*'],
        accessControlAllowOrigins: ['*'],
        accessControlExposeHeaders: [],
        accessControlMaxAge: Duration.seconds(600),
        originOverride: false, // Use the origin values, if any
      },
      customHeadersBehavior: {
        customHeaders: [
          //{ header: 'X-Amz-Date', value: 'some-value', override: true },
          //{ header: 'X-Amz-Security-Token', value: 'some-value', override: false },
        ],
      },
      securityHeadersBehavior: {
        contentSecurityPolicy: { contentSecurityPolicy: 'default-src https:;', override: true },
        contentTypeOptions: { override: true },
        frameOptions: { frameOption: HeadersFrameOption.DENY, override: true },
        referrerPolicy: { referrerPolicy: HeadersReferrerPolicy.NO_REFERRER, override: true },
        strictTransportSecurity: { accessControlMaxAge: Duration.seconds(600), includeSubdomains: true, override: true },
        xssProtection: { protection: true, modeBlock: false, reportUri: xssReportUri, override: true },
      },
      removeHeaders: ['Server'],
      serverTimingSamplingRate: 50,
    });
    return rval;
  }
}
