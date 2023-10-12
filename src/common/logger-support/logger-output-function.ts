// NOTE: This is a psuedo-enum to fix some issues with Typescript enums.  See: https://exploringjs.com/tackling-ts/ch_enum-alternatives.html for details

export const LoggerOutputFunction = {
  Console: 'Console',
  ConsoleNoDebug: 'ConsoleNoDebug',
  StdOut: 'StdOut',
};

export type LoggerOutputFunction = (typeof LoggerOutputFunction)[keyof typeof LoggerOutputFunction];
