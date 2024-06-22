export interface RequestResults<R> {
  results: R;
  fields?: Record<string,any>[];
}
