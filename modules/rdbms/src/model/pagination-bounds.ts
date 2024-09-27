/**
 * Defines the bounds of a paginator.
 *
 * Returns the min and max values for the column specified and the total count - can
 * be used to roughly predict page values
 */
export interface PaginationBounds<T> {
  cn: string;
  min: T;
  max: T;
  count: number;
}
