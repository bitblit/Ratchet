import { Bucket, BucketEncryption } from "aws-cdk-lib/aws-s3";
import { Duration, Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import path from "path";
import {
  Behavior,
  CloudFrontAllowedCachedMethods,
  CloudFrontAllowedMethods,
  CloudFrontWebDistribution,
  CloudFrontWebDistributionProps,
  HttpVersion,
  OriginAccessIdentity,
  OriginProtocolPolicy,
  PriceClass,
  SourceConfiguration,
  ViewerProtocolPolicy
} from "aws-cdk-lib/aws-cloudfront";
import { HostedZone, RecordSet, RecordType } from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { EpsilonWebsiteStackProps, EpsilonWebsiteStackPropsRoute53Handling } from "./epsilon-website-stack-props.js";
import { ErrorRatchet, StringRatchet } from "@bitblit/ratchet-common";
import { BucketAndSourceConfiguration } from "./bucket-and-source-configuration.js";
import { EpsilonWebsiteCacheBehavior } from "./epsilon-website-cache-behavior";

export class EpsilonWebsiteStack extends Stack {
  constructor(scope: Construct, id: string, props?: EpsilonWebsiteStackProps) {
    super(scope, id, props);

    const originAccessId: OriginAccessIdentity = new OriginAccessIdentity(this, id + 'OriginAccessId');

    const websiteBucket = new Bucket(this, id + 'DeployBucket', {
      bucketName: props.targetBucketName,
      //removalPolicy: RemovalPolicy.DESTROY,
      //autoDeleteObjects: true,
      versioned: false,
      publicReadAccess: false,
      encryption: BucketEncryption.S3_MANAGED,
      /*
            cors: [
              {
                allowedMethods: [
                  HttpMethods.GET,
                  HttpMethods.POST,
                  HttpMethods.PUT,
                ],
                allowedOrigins: ['http://localhost:3000'],
                allowedHeaders: ['*'],
              },
            ],

            lifecycleRules: [
              {
                abortIncompleteMultipartUploadAfter: cdk.Duration.days(90),
                expiration: cdk.Duration.days(365),
                transitions: [
                  {
                    storageClass: s3.StorageClass.INFREQUENT_ACCESS,
                    transitionAfter: cdk.Duration.days(30),
                  },
                ],
              },
            ],
                   */
    });

    // Any extra buckets are assumed to have been created outside of Epsilon, so they are imported not created
    const extraBucketAndSource: BucketAndSourceConfiguration[] = (props.simpleAdditionalMappings || []).map((eb) => {
      const nextBucket = Bucket.fromBucketAttributes(this, eb.bucketName + 'ImportedBucket', {
        bucketName: eb.bucketName,
      });

      const nextBS: BucketAndSourceConfiguration = {
        bucket: nextBucket,
        sourceConfig: {
          s3OriginSource: {
            s3BucketSource: nextBucket,
            originAccessIdentity: originAccessId,
          },
          behaviors: [
            {
              pathPattern: eb.pathPattern,
              isDefaultBehavior: false,
              compress: true,

              defaultTtl: Duration.seconds(1), //  Duration.days(100),
              minTtl: Duration.seconds(1), //Duration.days(90),
              maxTtl: Duration.seconds(1), //Duration.days(110),
              forwardedValues: {
                queryString: false,
              },
            },
          ],
        },
      };
      return nextBS;
    });

    //websiteBucket.grantReadWrite(webHandler);
    //websiteBucket.grantReadWrite(bgHandler);

    if (props.websiteCacheBehavior===EpsilonWebsiteCacheBehavior.Custom && !props?.websiteBehaviorOverride?.length) {
      throw ErrorRatchet.fErr('Custom cache behavior selected but no custom provided');
    }
    if (props.websiteCacheBehavior!==EpsilonWebsiteCacheBehavior.Custom && props?.websiteBehaviorOverride?.length) {
      throw ErrorRatchet.fErr('Custom cache behavior not selected but custom provided');
    }
    let websiteBehaviors: Behavior[];
    switch (props.websiteCacheBehavior) {
      // case EpsilonWebsiteCacheBehavior.Default: (done below)
      case EpsilonWebsiteCacheBehavior.NoCache:
        websiteBehaviors =  [
          {
            isDefaultBehavior: true,
            compress: true,
            defaultTtl: Duration.seconds(0), //  Duration.days(100),
            minTtl: Duration.seconds(0), //Duration.days(90),
            maxTtl: Duration.seconds(0), //Duration.days(110),
            forwardedValues: {
              queryString: false,
            },
          }
        ]; break;
      case EpsilonWebsiteCacheBehavior.Custom:
        websiteBehaviors = props.websiteBehaviorOverride; break;
      default:
        websiteBehaviors =  [
          {
            isDefaultBehavior: true,
            compress: true,
            defaultTtl: Duration.seconds(1), //  Duration.days(100),
            minTtl: Duration.seconds(1), //Duration.days(90),
            maxTtl: Duration.seconds(1), //Duration.days(110),
            forwardedValues: {
              queryString: false,
            },
          }
        ]; break;
    }

    const assetSource: SourceConfiguration = {
      s3OriginSource: {
        s3BucketSource: websiteBucket,
        originAccessIdentity: originAccessId,
      },
      behaviors:websiteBehaviors
    };

    //const parseUrl: URL = new URL(fnUrl.url);
    const apiSources: SourceConfiguration[] = (props.apiMappings || []).map((s) => {
      const next: SourceConfiguration = {
        customOriginSource: {
          domainName: s.apiDomainName,
          originProtocolPolicy: OriginProtocolPolicy.HTTPS_ONLY,
        },
        //originPath: '/',
        behaviors: [
          {
            compress: true,
            forwardedValues: {
              queryString: true,
              cookies: {
                forward: 'whitelist',
                whitelistedNames: ['idToken'],
              },
              headers: ['Accept', 'Referer', 'Authorization', 'Content-Type'],
            },
            pathPattern: s.pathPattern, //'graphql'
            defaultTtl: Duration.seconds(0),
            maxTtl: Duration.seconds(0),
            minTtl: Duration.seconds(0),
            allowedMethods: CloudFrontAllowedMethods.ALL,
            cachedMethods: CloudFrontAllowedCachedMethods.GET_HEAD,
          },
        ],
      };
      return next;
    });

    const distributionProps: CloudFrontWebDistributionProps = {
      httpVersion: HttpVersion.HTTP2,
      defaultRootObject: 'index.html',
      originConfigs: [assetSource, ...apiSources, ...extraBucketAndSource.map((s) => s.sourceConfig)],
      errorConfigurations: [
        {
          errorCode: 404,
          errorCachingMinTtl: 300,
          responseCode: 200,
          responsePagePath: '/index.html',
        },
        {
          errorCode: 403,
          errorCachingMinTtl: 300,
          responseCode: 200,
          responsePagePath: '/index.html',
        },
      ],
      priceClass: PriceClass.PRICE_CLASS_ALL,
      viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      viewerCertificate: {
        aliases: props.cloudFrontDomainNames,
        props: {
          acmCertificateArn: props.cloudFrontHttpsCertificateArn,
          sslSupportMethod: 'sni-only',
        },
      },
    };

    const cloudfrontDistro: CloudFrontWebDistribution = new CloudFrontWebDistribution(this, id + 'CloudfrontDistro', distributionProps);

    // Have to be able to skip this since SOME people don't do DNS in Route53
    if (props?.route53Handling === EpsilonWebsiteStackPropsRoute53Handling.Update) {
      if (props?.cloudFrontDomainNames?.length) {
        for (let i = 0; i < props.cloudFrontDomainNames.length; i++) {
          const domain = new RecordSet(this, id + 'DomainName-' + props.cloudFrontDomainNames[i], {
            recordType: RecordType.A,
            recordName: props.cloudFrontDomainNames[i],
            target: {
              aliasTarget: new CloudFrontTarget(cloudfrontDistro),
            },
            zone: HostedZone.fromLookup(this, id, { domainName: EpsilonWebsiteStack.extractApexDomain(props.cloudFrontDomainNames[i]) }),
          });
        }
      }
    }

    //  [Source.asset(path.resolve('../website/dist'))],
    new BucketDeployment(this, id + 'SiteDeploy', {
      sources: props.pathsToAssets.map((inPath) => Source.asset(path.resolve(inPath))),
      destinationBucket: websiteBucket,
      distribution: cloudfrontDistro,
      distributionPaths: ['/*'], //'/locales/*', '/index.html', '/manifest.webmanifest', '/service-worker.js']
    });
  }

  public static extractApexDomain(domainName: string): string {
    const pieces: string[] = StringRatchet.trimToEmpty(domainName).split('.');
    if (pieces.length < 2) {
      ErrorRatchet.throwFormattedErr('Not a valid domain name : %s', domainName);
    }
    return pieces[pieces.length - 2] + '.' + pieces[pieces.length - 1];
  }
}

