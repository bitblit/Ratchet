// Simple switch to see what kind of event I am looking at
/* eslint-disable  @typescript-eslint/explicit-module-boundary-types */
import { APIGatewayEvent, APIGatewayProxyEventV2, DynamoDBStreamEvent, S3Event, ScheduledEvent, SNSEvent, SQSEvent } from 'aws-lambda';
import { LambdaEventDetector } from './lambda-event-detector.js';

export class LambdaEventTypeGuards {
  public static isValidCronEvent(event: any): event is ScheduledEvent {
    return LambdaEventDetector.isValidCronEvent(event);
  }

  public static isValidSqsEvent(event: any): event is SQSEvent {
    return LambdaEventDetector.isValidSqsEvent(event);
  }

  public static isValidSnsEvent(event: any): event is SNSEvent {
    return LambdaEventDetector.isValidSnsEvent(event);
  }

  public static isValidDynamoDBEvent(event: any): event is DynamoDBStreamEvent {
    return LambdaEventDetector.isValidDynamoDBEvent(event);
  }

  public static isValidS3Event(event: any): event is S3Event {
    return LambdaEventDetector.isValidS3Event(event);
  }

  public static isValidApiGatewayV2WithRequestContextEvent(event: any): event is APIGatewayProxyEventV2 {
    return LambdaEventDetector.isValidApiGatewayV2WithRequestContextEvent(event);
  }

  public static isValidApiGatewayEvent(event: any): event is APIGatewayEvent {
    return LambdaEventDetector.isValidApiGatewayEvent(event);
  }

  public static isValidApiGatewayAuthorizerEvent(event: any): boolean {
    return LambdaEventDetector.isValidApiGatewayAuthorizerEvent(event);
  }
}
