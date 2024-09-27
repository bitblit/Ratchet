/**
 * Results of sending an email
 */
export interface ArchiveEmailResult<R> {
  raw: R;
  error: string;
  meta: Record<string, any>;
}
