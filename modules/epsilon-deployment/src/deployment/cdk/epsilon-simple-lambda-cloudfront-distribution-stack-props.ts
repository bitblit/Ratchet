import { StackProps } from "aws-cdk-lib";
import { CachePolicy, PriceClass, SSLMethod, ViewerProtocolPolicy } from "aws-cdk-lib/aws-cloudfront";
import { FunctionUrl } from "aws-cdk-lib/aws-lambda";
import { EpsilonRoute53Handling } from "./epsilon-route-53-handling";

export interface EpsilonSimpleLambdaCloudfrontDistributionStackProps extends StackProps {
  lambdaFunctionDomain: FunctionUrl;
  httpsCertArn: string;
  domainNames: string[];
  protocolPolicy?: ViewerProtocolPolicy;
  cachePolicy?: CachePolicy;
  priceClass?: PriceClass;
  sslMethod?: SSLMethod;
  route53Handling?: EpsilonRoute53Handling;
}
