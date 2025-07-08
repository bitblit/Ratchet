import { LocalServerHttpMethodHandling } from './local-server-http-method-handling.js';
import { LocalServerEventLoggingStyle } from "./local-server-event-logging-style.ts";
import { LoggerLevelName } from "@bitblit/ratchet-common/logger/logger-level-name";

export interface LocalServerOptions {
  port?: number;
  https?: boolean;
  methodHandling?: LocalServerHttpMethodHandling;
  eventLoggingStyle?: LocalServerEventLoggingStyle;
  eventLoggingLevel?: LoggerLevelName;
  graphQLIntrospectionEventLogLevel?: LoggerLevelName;
}
