export interface QueryResults<R> {
  results: R;
  fields?: Record<string,any>[];
}
