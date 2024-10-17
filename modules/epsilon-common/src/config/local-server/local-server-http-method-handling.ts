// NOTE: This is a psuedo-enum to fix some issues with Typescript enums.  See: https://exploringjs.com/tackling-ts/ch_enum-alternatives.html for details
export const LocalServerHttpMethodHandling = {
  Uppercase: 'Uppercase',
  Lowercase: 'Lowercase',
  PassThru: 'PassThru',
};
export type LocalServerHttpMethodHandling = (typeof LocalServerHttpMethodHandling)[keyof typeof LocalServerHttpMethodHandling];
