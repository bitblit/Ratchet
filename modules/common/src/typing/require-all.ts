/**
 * This is used in a "satisfy" clause to make sure that an object
 * MUST contain all fields that the referred type does have
 */
export type RequireAll<T> = {
  [K in keyof T]-?: NonNullable<T[K]>;
};