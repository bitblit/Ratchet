 # Ratchet-Epsilon-Deployment

CDK constructs to simplify Epsilon deployments

You may wish to read [the changelog](CHANGELOG.md)

# TODO:

# CDK Automatic Construction

## Introduction

## Prerequisites

- Any time you are doing something automated like this, I **HIGHLY RECOMMEND** setting up a billing alert first. Don't
  blame me if you skip this step and then accidentally spend $1,000 next month. (https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/monitor_estimated_charges_with_cloudwatch.html)
- CDK V2 must be bootstrapped in your account (https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html)
  -- e.g. (**npx cdk bootstrap aws://1234567890/us-east-1**)
- The user running the CDK deploy needs -LOTS- of AWS privs (I'll list them all later. For now, assume a bunch)
- Policy **arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole** must exist (this should be there by default)
- Policy **arn:aws:iam::aws:policy/service-role/AWSBatchServiceRole** must exist (You may have to create it - see https://docs.aws.amazon.com/batch/latest/userguide/service_IAM_role.html)
- You should have a VPC that your Lambda's will deploy into, and you should know its id (e.g., **vpc-123456789**)
- That VPC should have one or more subnets, and you should know their ids (e.g., **05966bfadca940a88**)
- That VPC should have a security group, which probably should allow outbound traffic if you want your lambda to talk to the internet. You should know its id (e.g., **02a89a55b0f2cb4ae** - leave off the **sg-** prefix)

## Api Setup

- Your api layer, in addition to depending on Epsilon, will need:
  ** "aws-cdk-lib": (Peer version)
  ** "constructs": (Peer version)
  \*\* "walk": (Peer version)

## Docker setup

### .dockerignore

In general the docker file needs to be in a folder above both your api and cdk folders, but it must ignore
the cdk folder in that case or it will infinitely recurse

```
# Need this here to prevent infinite recusion of cdk folder at least
.github
.idea
.yarn
.git
modules/cdk
node_modules
```

### DockerFile

```
FROM public.ecr.aws/lambda/nodejs:14
COPY modules/api/package.json modules/api/gql-codegen.yml modules/api/tsconfig.json ${LAMBDA_TASK_ROOT}/
COPY modules/api/src ${LAMBDA_TASK_ROOT}/src
COPY lambda-bootstrap-shell.sh ${LAMBDA_TASK_ROOT}
RUN npm install -g yarn
RUN yarn install
RUN yarn clean-compile
ENTRYPOINT ["sh","/var/task/lambda-bootstrap-shell.sh"]
CMD [ "dist/lambda.handler" ]
```

### lambda-bootstrap-shell.sh

```
#!/bin/sh
# Based on the default script in public.ecr.aws/lambda/nodejs:14, which is copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# Modifications copyright Christopher Weiss, 2022

if [ -z "${EPSILON_RUNNING_IN_AWS_BATCH}" ]; then
    if [ $# -lt 1 ]; then
      echo "entrypoint requires the handler name to be the first argument" 1>&2
      exit 142
    fi
    export _HANDLER="$1"

    RUNTIME_ENTRYPOINT=/var/runtime/bootstrap
    if [ -z "${AWS_LAMBDA_RUNTIME_API}" ]; then
      exec /usr/local/bin/aws-lambda-rie $RUNTIME_ENTRYPOINT
    else
      exec $RUNTIME_ENTRYPOINT
    fi
  else
    echo "Running Epsilon inside AWS batch - triggering direct $1 $2"
    exec node dist/aws-batch-cli.js --process $1 --data $2
fi
```
