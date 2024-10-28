// NOTE: This is a psuedo-enum to fix some issues with Typescript enums.  See: https://exploringjs.com/tackling-ts/ch_enum-alternatives.html for details
export const EpsilonServerMode = {
  Production: 'Production',
  Development: 'Development',
  QA: 'QA',
  Red: 'Red',
  Blue: 'Blue',
  Green: 'Green'
};
export type EpsilonServerMode = (typeof EpsilonServerMode)[keyof typeof EpsilonServerMode];
