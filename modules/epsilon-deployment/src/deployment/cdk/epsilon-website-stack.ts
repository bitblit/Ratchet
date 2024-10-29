import { Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { Duration, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import path from 'path';
import {
  AllowedMethods,
  BehaviorOptions,
  CachePolicy,
  Distribution,
  DistributionProps,
  OriginAccessIdentity,
  PriceClass,
  ResponseHeadersPolicy,
  SSLMethod,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { HostedZone, RecordSet, RecordType } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { BucketDeployment, ISource, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { EpsilonWebsiteStackProps } from './epsilon-website-stack-props.js';
import { EpsilonStackUtil } from './epsilon-stack-util.js';
import { EpsilonRoute53Handling } from './epsilon-route-53-handling';
import { FunctionUrlOrigin, S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Certificate, ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { Logger } from '@bitblit/ratchet-common/logger/logger';

export class EpsilonWebsiteStack extends Stack {
  constructor(scope: Construct, id: string, props?: EpsilonWebsiteStackProps) {
    super(scope, id, props);

    const originAccessId: OriginAccessIdentity = new OriginAccessIdentity(this, id + 'OriginAccessId');

    const websiteBucket: Bucket = new Bucket(this, id + 'DeployBucket', {
      bucketName: props.targetBucketName,
      //removalPolicy: RemovalPolicy.DESTROY,
      //autoDeleteObjects: true,
      versioned: false,
      publicReadAccess: false,
      encryption: BucketEncryption.S3_MANAGED,
    });

    const cachePolicy: CachePolicy = new CachePolicy(this, id + 'ShortCachePolicy', {
      defaultTtl: Duration.seconds(1),
      maxTtl: Duration.seconds(1),
      minTtl: Duration.seconds(1),
    });

    const defaultBehavior: BehaviorOptions = {
      origin: S3BucketOrigin.withOriginAccessIdentity(websiteBucket, { originAccessIdentity: originAccessId }), //  new FunctionUrlOrigin(props.lambdaFunctionDomain),
      compress: true,
      viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      cachePolicy: cachePolicy,
      allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
    };

    const httpsCertificate: ICertificate = Certificate.fromCertificateArn(this, id + 'HttpsCert', props.cloudFrontHttpsCertificateArn);

    const distributionProps: DistributionProps = {
      defaultBehavior: defaultBehavior,
      defaultRootObject: 'index.html',
      priceClass: PriceClass.PRICE_CLASS_ALL,
      certificate: httpsCertificate,
      domainNames: props.cloudFrontDomainNames,
      sslSupportMethod: SSLMethod.SNI,
      additionalBehaviors: {}, // Will be added after
      errorResponses: [
        {
          httpStatus: 404,
          ttl: Duration.seconds(300),
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
        {
          httpStatus: 403,
          ttl: Duration.seconds(300),
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
    };

    // Add api sources, if any
    (props.apiMappings || []).forEach((s) => {
      const next: BehaviorOptions = {
        origin: new FunctionUrlOrigin(s.lambdaFunctionUrl),
        compress: true,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: CachePolicy.CACHING_DISABLED,
        allowedMethods: AllowedMethods.ALLOW_ALL,
        responseHeadersPolicy: s.responseHeadersPolicyCreator
          ? s.responseHeadersPolicyCreator(scope, id)
          : ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS_WITH_PREFLIGHT_AND_SECURITY_HEADERS,
      };
      distributionProps.additionalBehaviors[s.pathPattern] = next;
    });

    // Add extra bucket mappings, if any
    // Any extra buckets are assumed to have been created outside of Epsilon, so they are imported not created
    (props.simpleAdditionalMappings || []).forEach((eb) => {
      const nextBucket = Bucket.fromBucketAttributes(this, eb.bucketName + 'ImportedBucket', {
        bucketName: eb.bucketName,
      });

      const behaviorOptions: BehaviorOptions = {
        origin: S3BucketOrigin.withOriginAccessIdentity(nextBucket, { originAccessIdentity: originAccessId }),
        compress: true,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cachePolicy,
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
      };

      distributionProps.additionalBehaviors[eb.pathPattern] = behaviorOptions;
    });

    // Create the distro
    const cloudfrontDistro: Distribution = new Distribution(this, id + 'CloudfrontDistro', distributionProps);

    // Have to be able to skip this since SOME people don't do DNS in Route53
    if (props?.route53Handling === EpsilonRoute53Handling.Update) {
      if (props?.cloudFrontDomainNames?.length) {
        for (let i = 0; i < props.cloudFrontDomainNames.length; i++) {
          const domain: RecordSet = new RecordSet(this, id + 'DomainName-' + props.cloudFrontDomainNames[i], {
            recordType: RecordType.A,
            recordName: props.cloudFrontDomainNames[i],
            target: {
              aliasTarget: new CloudFrontTarget(cloudfrontDistro),
            },
            zone: HostedZone.fromLookup(this, id, { domainName: EpsilonStackUtil.extractApexDomain(props.cloudFrontDomainNames[i]) }),
          });
        }
      }
    }

    const assetSources: ISource[] = props.pathsToAssets.map((inPath) => Source.asset(path.resolve(inPath)));
    Logger.info('Found %d asset sources to push to S3', assetSources.length);

    // Sync files to the S3 Bucket
    //  [Source.asset(path.resolve('../website/dist'))],
    new BucketDeployment(this, id + 'SiteDeploy', {
      sources: assetSources,
      destinationBucket: websiteBucket,
      distribution: cloudfrontDistro,
      distributionPaths: ['/*'], //'/locales/*', '/index.html', '/manifest.webmanifest', '/service-worker.js']
    });
  }
}
