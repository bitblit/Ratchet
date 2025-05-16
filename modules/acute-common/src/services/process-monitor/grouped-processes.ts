import { ProcessHolder } from "./process-holder.ts";

export interface GroupedProcesses {
  group: string;
  processes: ProcessHolder<any>[];
}
