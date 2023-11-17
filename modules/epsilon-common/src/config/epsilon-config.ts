import { HttpConfig } from './http/http-config.js';
import { BackgroundConfig } from './background/background-config.js';
import { CronConfig } from './cron/cron-config.js';
import { DynamoDbConfig } from './dynamo-db-config.js';
import { S3Config } from './s3-config.js';
import { SnsConfig } from './sns-config.js';
import { EpsilonLoggerConfig } from './epsilon-logger-config.js';
import { InterApiConfig } from './inter-api/inter-api-config.js';
import { SqsConfig } from './sqs-config';

export interface EpsilonConfig {
  label?: string;
  // If disabled, last resort timeout will instead roll to lambda (not recommended)
  disableLastResortTimeout?: boolean;
  throwErrorIfNoSuitableEventHandlers?: boolean;

  openApiYamlString: string;
  httpConfig?: HttpConfig;

  backgroundConfig?: BackgroundConfig;
  interApiConfig?: InterApiConfig;

  cron?: CronConfig;
  dynamoDb?: DynamoDbConfig;
  s3?: S3Config;
  sns?: SnsConfig;
  sqs?: SqsConfig;

  loggerConfig?: EpsilonLoggerConfig;
}
