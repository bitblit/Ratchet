import {BehaviorSubject} from "rxjs";
import {ProcessMonitorState} from "./process-monitor-state";


export interface ProcessHolder<T> {
  guid: string;
  proc: Promise<T>;
  input: BehaviorSubject<ProcessMonitorState>;
}
