import { Context } from 'aws-lambda';

export type LoggingTraceIdGenerator = (event?: any, context?: Context) => string;
