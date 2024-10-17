import { FunctionUrl } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { IResponseHeadersPolicy } from "aws-cdk-lib/aws-cloudfront";

export interface EpsilonLambdaToCloudfrontPathMapping {
  lambdaFunctionUrl: FunctionUrl;
  pathPattern: string;
  responseHeadersPolicyCreator?: (scope: Construct, id: string)=>IResponseHeadersPolicy;
}
