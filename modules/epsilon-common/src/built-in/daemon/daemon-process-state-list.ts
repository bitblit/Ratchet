import { DaemonProcessState } from '@bitblit/ratchet-aws/daemon/daemon-process-state.js';

/**
 * Wrapper for future pagination capability
 */
export interface DaemonProcessStateList {
  results: DaemonProcessState[];
  nextToken: string;
}
