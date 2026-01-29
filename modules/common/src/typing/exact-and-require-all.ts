import { RequireAll } from "./require-all.ts";
import { Exact } from "./exact.ts";

/**
 * This is used in a "satisfy" clause to make sure that an object
 * contains all the fields in T and does not contain any fields
 * not in T
 */
export type ExactAndRequireAll<T> = Exact<RequireAll<T>>;