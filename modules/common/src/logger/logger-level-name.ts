// NOTE: This is a psuedo-enum to fix some issues with Typescript enums.  See: https://exploringjs.com/tackling-ts/ch_enum-alternatives.html for details

export const LoggerLevelName = {
  error: 'error',
  warn: 'warn',
  info: 'info',
  verbose: 'verbose',
  debug: 'debug',
  silly: 'silly',
} as const;
export type LoggerLevelName = (typeof LoggerLevelName)[keyof typeof LoggerLevelName];
