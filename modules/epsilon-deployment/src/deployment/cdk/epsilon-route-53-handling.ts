// NOTE: This is a psuedo-enum to fix some issues with Typescript enums.  See: https://exploringjs.com/tackling-ts/ch_enum-alternatives.html for details

export const EpsilonRoute53Handling = {
  Update: 'Update',
  DoNotUpdate: 'DoNotUpdate',
};
export type EpsilonRoute53Handling = (typeof EpsilonRoute53Handling)[keyof typeof EpsilonRoute53Handling];
