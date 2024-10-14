import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  AllowedMethods,
  BehaviorOptions,
  CachePolicy, Distribution,
  DistributionProps, IResponseHeadersPolicy,
  PriceClass, ResponseHeadersPolicy,
  SSLMethod,
  ViewerProtocolPolicy
} from "aws-cdk-lib/aws-cloudfront";
import { FunctionUrlOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import {
  EpsilonSimpleLambdaCloudfrontDistributionStackProps
} from "./epsilon-simple-lambda-cloudfront-distribution-stack-props";
import { Certificate, ICertificate } from "aws-cdk-lib/aws-certificatemanager";
import { HostedZone, RecordSet, RecordType } from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import { EpsilonRoute53Handling } from "./epsilon-route-53-handling";
import { EpsilonStackUtil } from "./epsilon-stack-util";

export class EpsilonSimpleLambdaCloudfrontDistributionStack extends Stack {
  constructor(scope: Construct, id: string, props?: EpsilonSimpleLambdaCloudfrontDistributionStackProps) {
    super(scope, id, props);

    let policy: IResponseHeadersPolicy = ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS_WITH_PREFLIGHT_AND_SECURITY_HEADERS;
    if (props.responseHeadersPolicyCreator) {
      policy = props.responseHeadersPolicyCreator(scope, id);
    }

    const behavior: BehaviorOptions = {
      origin: new FunctionUrlOrigin(props.lambdaFunctionDomain),
      compress: true,
      viewerProtocolPolicy: props.protocolPolicy ?? ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      cachePolicy: props.cachePolicy ?? CachePolicy.CACHING_DISABLED,
      allowedMethods: props.allowedMethods ?? AllowedMethods.ALLOW_ALL,
      responseHeadersPolicy: policy
    };

    const httpsCertificate: ICertificate = Certificate.fromCertificateArn(scope, id + 'HttpsCert', props.httpsCertArn);

    const distributionProps: DistributionProps = {
      defaultBehavior: behavior,
      priceClass: props.priceClass ?? PriceClass.PRICE_CLASS_ALL,
      certificate: httpsCertificate,
      domainNames: props.domainNames,
      sslSupportMethod: props.sslMethod ?? SSLMethod.SNI,
    };

    const dist: Distribution = new Distribution(scope, id + 'CloudfrontDistro', distributionProps);

    // Have to be able to skip this since SOME people don't do DNS in Route53
    if (props?.route53Handling === EpsilonRoute53Handling.Update) {
      if (props?.domainNames?.length) {
        for (let i = 0; i < props.domainNames.length; i++) {
          const domain = new RecordSet(this, id + 'DomainName-' + props.domainNames[i], {
            recordType: RecordType.A,
            recordName: props.domainNames[i],
            target: {
              aliasTarget: new CloudFrontTarget(dist),
            },
            zone: HostedZone.fromLookup(scope, id, { domainName: EpsilonStackUtil.extractApexDomain(props.domainNames[i]) }),
          });
        }
      }
    }

  }
}
