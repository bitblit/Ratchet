import { StackProps } from 'aws-cdk-lib';
import {
  AllowedMethods,
  ICachePolicy,
  IResponseHeadersPolicy,
  PriceClass,
  SSLMethod,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { FunctionUrl } from 'aws-cdk-lib/aws-lambda';
import { EpsilonRoute53Handling } from './epsilon-route-53-handling';
import { Construct } from 'constructs';

export interface EpsilonSimpleLambdaCloudfrontDistributionStackProps extends StackProps {
  lambdaFunctionDomain: FunctionUrl;
  httpsCertArn: string;
  domainNames: string[];
  protocolPolicy?: ViewerProtocolPolicy;
  cachePolicy?: ICachePolicy;
  priceClass?: PriceClass;
  sslMethod?: SSLMethod;
  route53Handling?: EpsilonRoute53Handling;
  allowedMethods?: AllowedMethods;
  responseHeadersPolicyCreator?: (scope: Construct, id: string) => IResponseHeadersPolicy;
}
