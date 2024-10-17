// NOTE: This is a psuedo-enum to fix some issues with Typescript enums.  See: https://exploringjs.com/tackling-ts/ch_enum-alternatives.html for details
export const EpsilonCorsApproach = {
  None: 'None',
  All: 'All',
  Reflective: 'Reflective',
};
export type EpsilonCorsApproach = (typeof EpsilonCorsApproach)[keyof typeof EpsilonCorsApproach];
