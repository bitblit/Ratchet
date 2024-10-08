import { StackProps } from "aws-cdk-lib";
import { ICachePolicy, PriceClass, SSLMethod, ViewerProtocolPolicy } from "aws-cdk-lib/aws-cloudfront";
import { FunctionUrl } from "aws-cdk-lib/aws-lambda";
import { EpsilonRoute53Handling } from "./epsilon-route-53-handling";

export interface EpsilonSimpleLambdaCloudfrontDistributionStackProps extends StackProps {
  lambdaFunctionDomain: FunctionUrl;
  httpsCertArn: string;
  domainNames: string[];
  protocolPolicy?: ViewerProtocolPolicy;
  cachePolicy?: ICachePolicy;
  priceClass?: PriceClass;
  sslMethod?: SSLMethod;
  route53Handling?: EpsilonRoute53Handling;
}
