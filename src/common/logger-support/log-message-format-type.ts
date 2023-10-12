// NOTE: This is a psuedo-enum to fix some issues with Typescript enums.  See: https://exploringjs.com/tackling-ts/ch_enum-alternatives.html for details

export const LogMessageFormatType = {
  ClassicSingleLine: 'ClassicSingleLine',
  StructuredJson: 'StructuredJson',
  None: 'None',
} as const;
export type LogMessageFormatType = (typeof LogMessageFormatType)[keyof typeof LogMessageFormatType];
