export type Exact<T extends object> =
  T & Partial<Record<Exclude<string, keyof T>, never>>;