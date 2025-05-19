import {ProcessMonitorState} from "./process-monitor-state";
import { WritableSignal } from "@angular/core";

export interface ProcessHolder<T> {
  guid: string;
  proc: Promise<T>;
  input: WritableSignal<ProcessMonitorState>;
  group: string;
  modal: boolean;
}
