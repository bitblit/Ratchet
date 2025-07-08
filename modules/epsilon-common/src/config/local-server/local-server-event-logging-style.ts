// NOTE: This is a psuedo-enum to fix some issues with Typescript enums.  See: https://exploringjs.com/tackling-ts/ch_enum-alternatives.html for details
export const LocalServerEventLoggingStyle = {
  Full: 'Full', // Log the full event to output
  FullWithBase64Decode: 'FullWithBase64Decode', // Log the full event and decode any base64 bodies
  Summary: 'Summary', // Just log a summary to output
  None: 'None', // Do not log events
};
export type LocalServerEventLoggingStyle = (typeof LocalServerEventLoggingStyle)[keyof typeof LocalServerEventLoggingStyle];
