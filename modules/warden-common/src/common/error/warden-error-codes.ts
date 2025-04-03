// NOTE: This is a psuedo-enum to fix some issues with Typescript enums.  See: https://exploringjs.com/tackling-ts/ch_enum-alternatives.html for details

export const WardenErrorCode = {
  Unspecified: 100,
  InvalidLoginToken: 200,
  ExpiredLoginToken: 300,
} as const;

export type WardenErrorCode = (typeof WardenErrorCode)[keyof typeof WardenErrorCode];
