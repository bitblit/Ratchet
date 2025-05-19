
/** This is all the stuff that can be updated during a process */
export interface ProcessMonitorState {
  label: string;
  detail?: string;
  percentComplete?: number;
}
