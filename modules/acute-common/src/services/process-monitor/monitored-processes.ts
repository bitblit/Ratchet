import { ProcessHolder } from "./process-holder.ts";

export interface MonitoredProcesses {
  processes: ProcessHolder<any>[];
}
