/**
 * This is used in a "satisfy" clause to make sure that an object
 * DOES NOT contain any fields that the referred type doesn't have
 */
export type Exact<T extends object> =
  T & Partial<Record<Exclude<string, keyof T>, never>>;