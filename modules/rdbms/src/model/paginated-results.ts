export interface PaginatedResults<T> {
  results: T[];
  nextPageToken: string;
  prevPageToken: string;
}
