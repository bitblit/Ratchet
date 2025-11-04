import { ProcessHolder } from "./process-holder";

export interface MonitoredProcesses {
  processes: ProcessHolder<any>[];
}
