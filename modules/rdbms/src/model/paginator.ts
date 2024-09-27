import { SortDirection } from './sort-direction.js';
import { JwtTokenBase } from '@bitblit/ratchet-common/jwt/jwt-token-base';

/**
 * Defines a paginator.
 *
 * Field names are short in here because this gets serialized when passed back and forth.  They are:
 * cn: ColumnName (required)
 * min: min value for that column (optional)
 * max: max value for that column (optional)
 * s: sort direction for the column (optional, defaults to Asc)
 * l: limit (optional)
 */
export interface Paginator<T> extends JwtTokenBase {
  cn: string;
  min?: T;
  max?: T;
  s?: SortDirection;
  l?: number;
}
