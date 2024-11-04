import { Construct } from "constructs";
import {
  AllowedMethods,
  BehaviorOptions,
  CachePolicy,
  Distribution,
  DistributionProps,
  IResponseHeadersPolicy,
  OriginRequestPolicy,
  PriceClass,
  ResponseHeadersPolicy,
  SSLMethod,
  ViewerProtocolPolicy
} from "aws-cdk-lib/aws-cloudfront";
import { FunctionUrlOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import {
  EpsilonSimpleLambdaCloudfrontDistributionProps
} from "./epsilon-simple-lambda-cloudfront-distribution-props.js";
import { Certificate, ICertificate } from "aws-cdk-lib/aws-certificatemanager";

export class EpsilonSimpleLambdaCloudfrontDistribution extends Distribution {
  constructor(scope: Construct, id: string, props?: EpsilonSimpleLambdaCloudfrontDistributionProps) {

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
      originRequestPolicy: OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
      responseHeadersPolicy: policy,
    };

    const httpsCertificate: ICertificate = Certificate.fromCertificateArn(scope, id + 'HttpsCert', props.httpsCertArn);

    const distributionProps: DistributionProps = {
      defaultBehavior: behavior,
      priceClass: props.priceClass ?? PriceClass.PRICE_CLASS_ALL,
      certificate: httpsCertificate,
      domainNames: props.domainNames,
      sslSupportMethod: props.sslMethod ?? SSLMethod.SNI,
    };

    super(scope, id + 'CloudfrontDistro', distributionProps);

  }
}
