// Simple switch to see what kind of event I am looking at
/* eslint-disable  @typescript-eslint/explicit-module-boundary-types */
export class LambdaEventDetector {
  public static isValidCronEvent(event: any): boolean {
    return event && event.source == 'aws.events' && event.resources && event.resources.length > 0;
  }

  public static isValidSnsEvent(event: any): boolean {
    return event && event.Records && event.Records.length > 0 && event.Records[0].EventSource == 'aws:sns';
  }

  public static isValidSqsEvent(event: any): boolean {
    return event && event.Records && event.Records.length > 0 && event.Records[0].eventSource == 'aws:sqs';
  }

  public static isValidDynamoDBEvent(event: any): boolean {
    return event && event.Records && event.Records.length > 0 && event.Records[0].eventSource == 'aws:dynamodb';
  }

  public static isValidS3Event(event: any): boolean {
    return event && event.Records && event.Records.length > 0 && event.Records[0].eventSource == 'aws:s3';
  }

  public static isValidApiGatewayV2WithRequestContextEvent(event: any): boolean {
    return event && event.rawPath && event.requestContext && event.routeKey;
  }

  public static isValidApiGatewayEvent(event: any): boolean {
    return event && event.httpMethod && event.path && event.requestContext;
  }

  public static isValidApiGatewayAuthorizerEvent(event: any): boolean {
    return event && event.authorizationToken && event.methodArn;
  }

  public static isSingleCronEvent(event: any): boolean {
    return this.isValidCronEvent(event) && LambdaEventDetector.isSingleEntryEvent(event, 'resources');
  }

  public static isSingleSnsEvent(event: any): boolean {
    return this.isValidSnsEvent(event) && LambdaEventDetector.isSingleEntryEvent(event);
  }

  public static isSingleDynamoDBEvent(event: any): boolean {
    return this.isValidDynamoDBEvent(event) && LambdaEventDetector.isSingleEntryEvent(event);
  }

  public static isSingleS3Event(event: any): boolean {
    return this.isValidS3Event(event) && LambdaEventDetector.isSingleEntryEvent(event);
  }

  public static isSingleEntryEvent(event: any, entryName: string = 'Records'): boolean {
    return event && event[entryName] && event[entryName] instanceof Array && event[entryName].length === 1;
  }
}
