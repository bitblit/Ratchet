import { Progress } from '@aws-sdk/lib-storage';

export interface DaemonStreamDataOptions {
  overrideTargetFileName?: string;
  progressFn?: (progress: Progress) => void;
}
