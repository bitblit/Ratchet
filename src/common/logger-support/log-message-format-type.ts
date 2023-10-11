export const LogMessageFormatType = {
  ClassicSingleLine: 'ClassicSingleLine',
  StructuredJson: 'StructuredJson',
  None: 'None',
} as const;
export type LogMessageFormatType = (typeof LogMessageFormatType)[keyof typeof LogMessageFormatType];
