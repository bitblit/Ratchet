
// Simple switch to see what kind of event I am looking at
export class LambdaEventDetector {


    public static isValidCronEvent(event: any): boolean {
        return (event && event.source == 'aws.events' && event.resources && event.resources.length == 1);
    }

    public static isValidSnsEvent(event: any): boolean {
        return (event && event.Records && event.Records.length == 1 && event.Records[0].EventSource == 'aws:sns');
    }

    public static isValidDynamoDBEvent(event: any): boolean {
        return (event && event.Records && event.Records.length == 1 && event.Records[0].eventSource == 'aws:dynamodb');
    }

    public static isValidS3Event(event: any): boolean {
        return (event && event.Records && event.Records.length == 1 && event.Records[0].eventSource == 'aws:s3');
    }
}