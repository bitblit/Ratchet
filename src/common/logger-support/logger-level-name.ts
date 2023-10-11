export const LoggerLevelName = {
  error: 'error',
  warn: 'warn',
  info: 'info',
  verbose: 'verbose',
  debug: 'debug',
  silly: 'silly',
} as const;
export type LoggerLevelName = (typeof LoggerLevelName)[keyof typeof LoggerLevelName];
