import { Duration, Lazy, Size, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DockerImageCode, DockerImageFunction, FunctionUrl, FunctionUrlAuthType, HttpMethod } from 'aws-cdk-lib/aws-lambda';
import { ManagedPolicy, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Topic } from 'aws-cdk-lib/aws-sns';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { LambdaSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';

import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';
import { StringRatchet } from '@bitblit/ratchet-common';
import { EpsilonStackUtil } from './epsilon-stack-util.js';
import { EpsilonApiStackProps } from './epsilon-api-stack-props.js';
import { RatchetEpsilonDeploymentInfo } from '../../build/ratchet-epsilon-deployment-info.js';
import {
  EcsFargateContainerDefinition,
  EcsFargateContainerDefinitionProps,
  EcsJobDefinition,
  EcsJobDefinitionProps,
  FargateComputeEnvironment,
  FargateComputeEnvironmentProps,
  JobQueue,
  JobQueueProps,
} from 'aws-cdk-lib/aws-batch';
import { SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';

import { ContainerImage } from 'aws-cdk-lib/aws-ecs';
import { EpsilonApiStackFeature } from './epsilon-api-stack-feature.js';

export class EpsilonApiStack extends Stack {
  private webHandler: DockerImageFunction;
  private backgroundHandler: DockerImageFunction;

  public apiDomain: string;

  constructor(scope: Construct, id: string, props?: EpsilonApiStackProps) {
    super(scope, id, props);

    const disabledFeatures: EpsilonApiStackFeature[] = props?.disabledFeatures || [];

    // Build the docker image first
    const dockerImageAsset: DockerImageAsset = new DockerImageAsset(this, id + 'DockerImage', {
      directory: props.dockerFileFolder,
      file: props.dockerFileName,
    });
    const dockerImageCode: DockerImageCode = DockerImageCode.fromImageAsset(props.dockerFileFolder, { file: props.dockerFileName });

    const notificationTopic: Topic = new Topic(this, id + 'WorkNotificationTopic');
    const workQueue: Queue = new Queue(this, id + 'WorkQueue', {
      fifo: true,
      retentionPeriod: Duration.hours(8),
      visibilityTimeout: Duration.minutes(5),
      contentBasedDeduplication: true,
      ...props,
    });

    const interApiGenericEventTopic: Topic = new Topic(this, id + 'InterApiTopic');

    const epsilonEnv: Record<string, string> = {
      EPSILON_AWS_REGION: StringRatchet.safeString(Stack.of(this).region),
      EPSILON_AWS_AVAILABILITY_ZONES: StringRatchet.safeString(JSON.stringify(Stack.of(this).availabilityZones)),
      EPSILON_BACKGROUND_SQS_QUEUE_URL: StringRatchet.safeString(workQueue.queueUrl),
      EPSILON_BACKGROUND_SNS_TOPIC_ARN: StringRatchet.safeString(notificationTopic.topicArn),
      EPSILON_INTER_API_EVENT_TOPIC_ARN: StringRatchet.safeString(interApiGenericEventTopic.topicArn),
      EPSILON_LIB_BUILD_HASH: StringRatchet.safeString(RatchetEpsilonDeploymentInfo.buildInformation().hash),
      EPSILON_LIB_BUILD_TIME: StringRatchet.safeString(RatchetEpsilonDeploymentInfo.buildInformation().timeBuiltISO),
      EPSILON_LIB_BUILD_BRANCH_OR_TAG: StringRatchet.safeString(
        RatchetEpsilonDeploymentInfo.buildInformation().branch || RatchetEpsilonDeploymentInfo.buildInformation().tag,
      ),
      EPSILON_LIB_BUILD_VERSION: StringRatchet.safeString(RatchetEpsilonDeploymentInfo.buildInformation().version),
    };
    const env: Record<string, string> = Object.assign({}, props.extraEnvironmentalVars || {}, epsilonEnv);

    if (!disabledFeatures.includes(EpsilonApiStackFeature.AwsBatchHandler)) {
      // Then build the Batch compute stuff...
      // This is the role that ECS uses to pull containers, secrets, etc
      const executionRole = new Role(this, id + 'BatchExecutionRole', {
        assumedBy: new ServicePrincipal('ecs-tasks.amazonaws.com'), //'ec2.amazonaws.com'),
        managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole')],
        inlinePolicies: {
          root: new PolicyDocument({
            statements: EpsilonStackUtil.ECS_POLICY_STATEMENTS,
          }),
        },
      });


      // This is the role used by the container to actually do business logic (your code uses this role)
      const jobRole = new Role(this, id + 'BatchJobRole', {
        assumedBy: new ServicePrincipal('ecs-tasks.amazonaws.com'),
        managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole')],
        inlinePolicies: {
          root: new PolicyDocument({
            statements: EpsilonStackUtil.createDefaultPolicyStatementList(props, workQueue, notificationTopic, interApiGenericEventTopic),
          }),
        },
      });

      //const subnetSelection: SubnetSelection = {
      //  subnets: props.vpcSubnetIds.map((subnetId, index) => Subnet.fromSubnetId(this, `VpcSubnet${index}`, `subnet-${subnetId}`)),
      //};

      // Created AWSServiceBatchRole
      // https://docs.aws.amazon.com/batch/latest/userguide/service_IAM_role.html
      const compEnvProps: FargateComputeEnvironmentProps = {
        vpc: Vpc.fromLookup(this, `Vpc`, { vpcId: props.vpcId }),
        computeEnvironmentName: id + 'ComputeEnv',
        enabled: true,
        maxvCpus: 16,
        replaceComputeEnvironment: false,
        securityGroups: props.lambdaSecurityGroupIds.map((sgId, index) =>
          SecurityGroup.fromSecurityGroupId(this, `SecurityGroup${index}`, `sg-${sgId}`),
        ),
        serviceRole: Role.fromRoleArn(this, `${id}ServiceRole`, 'arn:aws:iam::' + props.env.account + ':role/AWSBatchServiceRole'),
        spot: false,
        terminateOnUpdate: false,
        updateTimeout: Duration.hours(4),
        updateToLatestImageVersion: true,
        //vpcSubnets: subnetSelection,
      };

      const compEnv: FargateComputeEnvironment = new FargateComputeEnvironment(this, id + 'ComputeEnv', compEnvProps);

      const batchJobQueueProps: JobQueueProps = {
        computeEnvironments: [{ order: 1, computeEnvironment: compEnv }],
        enabled: true,
        jobQueueName: id + 'BatchJobQueue',
        priority: 10,
        schedulingPolicy: undefined, // Implement later?
      };

      const batchJobQueue = new JobQueue(this, id + 'BatchJobQueue', batchJobQueueProps);

      const batchEnvVars: Record<string, any> = EpsilonStackUtil.toEnvironmentVariables([
        env,
        props.extraEnvironmentalVars || {},
        {
          EPSILON_RUNNING_IN_AWS_BATCH: true,
        },
      ]);

      const containerDef: EcsFargateContainerDefinitionProps = {
        cpu: 4,
        image: ContainerImage.fromRegistry(dockerImageAsset.imageUri),
        memory: Size.mebibytes(8192),
        assignPublicIp: true, // Need this to talk to ECS to get the container
        command: ['Ref::taskName', 'Ref::taskDataBase64', 'Ref::traceId', 'Ref::traceDepth', 'Ref::taskMetaDataBase64'], // Bootstrap to the Lambda handler
        environment: batchEnvVars,
        executionRole: executionRole,
        //fargatePlatformVersion: undefined,
        jobRole: jobRole, //Role.fromRoleArn(this, `${id}JobRole`, jobRole.roleArn),
        //linuxParameters: undefined,
        readonlyRootFilesystem: false,
        //secrets: undefined,
        //user: undefined,
        volumes: [],
      };

      const fargateContainerDefinitionDef = new EcsFargateContainerDefinition(this, `${id}FargateContainerDefinition`, containerDef);

      const jobProps: EcsJobDefinitionProps = {
        jobDefinitionName: id + 'JobDefinition',
        retryAttempts: 3,
        retryStrategies: undefined,
        schedulingPriority: undefined,
        timeout: undefined,
        container: fargateContainerDefinitionDef,
      };

      const jobDef: EcsJobDefinition = new EcsJobDefinition(this, id + 'JobDefinition', jobProps);

      // Add AWS batch vars to the environment
      env['EPSILON_AWS_BATCH_JOB_DEFINITION_ARN'] = jobDef.jobDefinitionArn; //  .ref;
      env['EPSILON_AWS_BATCH_JOB_QUEUE_ARN'] = batchJobQueue.jobQueueArn; //  .ref;
    }

    // This is needed for both background and web lambdas
    const lambdaRole = new Role(this, 'customRole', {
      roleName: id + 'LambdaCustomRole',
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole')],
      inlinePolicies: {
        root: new PolicyDocument({
          statements: EpsilonStackUtil.createDefaultPolicyStatementList(props, workQueue, notificationTopic, interApiGenericEventTopic),
        }),
      },
    });

    if (!disabledFeatures.includes(EpsilonApiStackFeature.WebLambda)) {
      this.webHandler = new DockerImageFunction(this, id + 'Web', {
        //reservedConcurrentExecutions: 1,
        retryAttempts: 2,
        //allowAllOutbound: true, // Needs a VPC
        memorySize: props.webMemorySizeMb || 128,
        ephemeralStorageSize: Size.mebibytes(512),
        timeout: Duration.seconds(props.webTimeoutSeconds || 20),
        code: dockerImageCode,
        role: lambdaRole,
        environment: env,
      });

      if (props?.webLambdaPingMinutes && props.webLambdaPingMinutes > 0) {
        // Wire up the cron handler
        const rule = new Rule(this, id + 'WebKeepaliveRule', {
          schedule: Schedule.rate(Duration.minutes(Math.ceil(props.webLambdaPingMinutes))),
        });
        rule.addTarget(new LambdaFunction(this.webHandler));
      }

      const fnUrl: FunctionUrl = this.webHandler.addFunctionUrl({
        authType: FunctionUrlAuthType.NONE,
        cors: {
          allowedOrigins: ['*'],
          allowedHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key'],
          allowedMethods: [HttpMethod.ALL],
          allowCredentials: true,
        },
      });

      this.apiDomain = Lazy.uncachedString({
        produce: (context) => {
          const resolved = context.resolve(fnUrl.url);
          return { 'Fn::Select': [2, { 'Fn::Split': ['/', resolved] }] } as any;
        },
      });
    }

    if (!disabledFeatures.includes(EpsilonApiStackFeature.BackgroundLambda)) {
      this.backgroundHandler = new DockerImageFunction(this, id + 'Background', {
        //reservedConcurrentExecutions: 1,
        retryAttempts: 2,
        // allowAllOutbound: true,
        memorySize: props.backgroundMemorySizeMb || 3000,
        ephemeralStorageSize: Size.mebibytes(512),
        timeout: Duration.seconds(props.backgroundTimeoutSeconds || 900),
        code: dockerImageCode,
        role: lambdaRole,
        environment: env,
      });

      notificationTopic.addSubscription(new LambdaSubscription(this.backgroundHandler));
      interApiGenericEventTopic.addSubscription(new LambdaSubscription(this.backgroundHandler));

      // Wire up the cron handler
      const rule = new Rule(this, id + 'CronRule', {
        schedule: Schedule.rate(Duration.minutes(1)),
      });
      rule.addTarget(new LambdaFunction(this.backgroundHandler));
    }
  }
}
