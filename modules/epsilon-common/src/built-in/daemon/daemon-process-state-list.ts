import { DaemonProcessState } from '@bitblit/ratchet-aws';

/**
 * Wrapper for future pagination capability
 */
export interface DaemonProcessStateList {
  results: DaemonProcessState[];
  nextToken: string;
}
