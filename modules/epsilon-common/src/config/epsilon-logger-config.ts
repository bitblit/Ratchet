import { LoggerLevelName } from '@bitblit/ratchet-common/logger/logger-level-name';
import { LogMessageFormatType } from '@bitblit/ratchet-common/logger/log-message-format-type';
import { LoggingTraceIdGenerator } from './logging-trace-id-generator.js';

export interface EpsilonLoggerConfig {
  // If set, the logger will be set to this instead of the default
  envParamLogLevelName?: string;
  // If set, and the user provides the query param, the logger level will be set to this
  queryParamLogLevelName?: string;
  // If set, and the user provides the query param, the logger will use this common prefix for the transaction
  queryParamTracePrefixName?: string;
  // If set, this will be used to generate trace ids when none are provided - otherwise, defaults to the aws request id
  // If present, and a guid if not
  traceIdGenerator?: LoggingTraceIdGenerator;
  // Defaults to structured json - this is here so you can switch if you are running locally
  logMessageFormatType?: LogMessageFormatType;
  // Defaults to x-trace-id if not set
  traceHeaderName?: string;
  // Defaults to x-trace-depth if not set
  traceDepthHeaderName?: string;
  // Epsilon start/end messages are logged at this level (info by default)
  epsilonStartEndMessageLogLevel?: LoggerLevelName;
}
