// Simple switch to see what kind of event I am looking at

import { ProcessMonitorState } from "./services/process-monitor/process-monitor-state";

export class AcuteCommonTypeGuards {
  public static isProcessMonitorState(item: any): item is ProcessMonitorState {
    return item && item.label && typeof item.label === 'string'
      && !item.detail || typeof item.detail === 'string'
      && !item.group || typeof item.group === 'string'
      && !item.percentComplete || typeof item.percentComplete === 'number';
  }
}
