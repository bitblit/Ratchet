export type RequireAll<T> = {
  [K in keyof T]-?: NonNullable<T[K]>;
};