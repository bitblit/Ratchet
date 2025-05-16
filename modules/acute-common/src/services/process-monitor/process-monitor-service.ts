import { Injectable, signal, WritableSignal } from "@angular/core";
import {RequireRatchet} from "@bitblit/ratchet-common/lang/require-ratchet";
import {ProcessMonitorState} from './process-monitor-state';
import {StringRatchet} from "@bitblit/ratchet-common/lang/string-ratchet";
import {No} from "@bitblit/ratchet-common/lang/no";
import {ProcessHolder} from "./process-holder";
import { AcuteCommonTypeGuards } from "../../acute-common-type-guards.ts";
import { GroupedProcessList } from "./grouped-process-list.ts";
import { GroupedProcesses } from "./grouped-processes.ts";

// Service for providing visual feedback on an ongoing long-running process
@Injectable({providedIn: 'root'})
export class ProcessMonitorService {
  public static readonly DEFAULT_GROUP: string = 'Long-Running Process';

  private processMap: Map<string,ProcessHolder<any>> = new Map<string,ProcessHolder<any>>();
  private modalProcessMap: Map<string,ProcessHolder<any>> = new Map<string,ProcessHolder<any>>();

  public get showDisplay(): boolean {
    return this.processMap.size>0;
  }

  public get showModalDisplay(): boolean {
    return this.modalProcessMap.size>0;
  }

  public processes: WritableSignal<GroupedProcessList> = signal({groups:[]});
  public modalProcesses: WritableSignal<GroupedProcessList> = signal({groups:[]});

  // Fire and forget - just so you don't get warnings about the promise not being handled
  public fafMonitorProcessDefaultLabel<T>(promise: Promise<T>, modal?: boolean): void {
    this.monitorProcessSimple(promise, 'Processing...', modal).then(No.op);
  }

  // Fire and forget - just so you don't get warnings about the promise not being handled
  public fafMonitorProcessSimple<T>(promise: Promise<T>, label: string, modal?: boolean): void {
    this.monitorProcessSimple(promise, label, modal).then(No.op);
  }

  public fafMonitorProcess<T>(promise: Promise<T>, descriptor: ProcessMonitorState | WritableSignal<ProcessMonitorState>, modal?: boolean): void {
    const map: Map<string, ProcessHolder<any>> = modal? this.modalProcessMap : this.processMap;
    const sig: WritableSignal<GroupedProcessList> = modal? this.modalProcesses : this.processes;
    this.innerMonitorProcess(promise, descriptor, map, sig).then(No.op);
  }

  public async monitorProcessDefaultLabel<T>(promise: Promise<T>, modal?: boolean): Promise<T> {
    return this.monitorProcessSimple(promise, 'Processing...', modal);
  }

  public async monitorProcessSimple<T>(promise: Promise<T>, label: string, modal?: boolean): Promise<T> {
    const descriptor: WritableSignal<ProcessMonitorState> =
      signal(ProcessMonitorService.labelToProcessInput(label));
    return this.monitorProcess(promise, descriptor, modal);
  }

  public async monitorProcess<T>(promise: Promise<T>, descriptor: ProcessMonitorState | WritableSignal<ProcessMonitorState>, modal?: boolean): Promise<T> {
    const map: Map<string, ProcessHolder<any>> = modal? this.modalProcessMap : this.processMap;
    const sig: WritableSignal<GroupedProcessList> = modal? this.modalProcesses : this.processes;
    return this.innerMonitorProcess(promise, descriptor, map, sig);
  }

  private async innerMonitorProcess<T>(promise: Promise<T>, descriptor: ProcessMonitorState | WritableSignal<ProcessMonitorState>, map: Map<string,ProcessHolder<any>>, sigOut: WritableSignal<GroupedProcessList>): Promise<T> {
    RequireRatchet.notNullOrUndefined(promise, 'promise');
    RequireRatchet.notNullOrUndefined(descriptor, 'descriptor');

    const bh: WritableSignal<ProcessMonitorState> =
      AcuteCommonTypeGuards.isProcessMonitorState(descriptor) ? signal(descriptor) : descriptor;

    const holder: ProcessHolder<T> = {
      guid: StringRatchet.createRandomHexString(10),
      proc: promise,
      input: bh
    };

    map.set(holder.guid, holder);

    const finished: Promise<T> = holder.proc.finally(()=>{
      map.delete(holder.guid);
    });

    const newList: GroupedProcessList = this.mapToGroupedProcessList(map);
    sigOut.set(newList);

    return finished;
  }

  private mapToGroupedProcessList(map: Map<string, ProcessHolder<any>>): GroupedProcessList {
    if (map.size>0) {
      //debugger;
    }

    const rval: GroupedProcessList = {
      groups: []
    };

    if (map) {
      map.keys().forEach((key)=>{
        const v: ProcessHolder<any> = map.get(key);
        const group: string = StringRatchet.trimToEmpty(v.input().group);
        let out: GroupedProcesses = rval.groups.find(s=>s.group===group);
        if (!out) {
          out = {
            group: group,
            processes: []
          };
          rval.groups.push(out);
        };
        out.processes.push(v);
      });
    }

    return rval;
  }

  public static labelToProcessInput(label: string): ProcessMonitorState {
    return {
      label: label,
      detail: null,
      group: ProcessMonitorService.DEFAULT_GROUP,
      percentComplete: null
    };
  }

  private defaultInput(): ProcessMonitorState {
    return {
      label: 'Process',
      detail: null,
      group: ProcessMonitorService.DEFAULT_GROUP,
      percentComplete: null
    };
  }

}
