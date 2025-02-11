import {Injectable} from '@angular/core';
import {RequireRatchet} from "@bitblit/ratchet-common/lang/require-ratchet";
import {ProcessMonitorState} from './process-monitor-state';
import {BehaviorSubject} from "rxjs";
import {StringRatchet} from "@bitblit/ratchet-common/lang/string-ratchet";
import {No} from "@bitblit/ratchet-common/lang/no";
import {ProcessHolder} from "./process-holder";

// Service for providing visual feedback on an ongoing long-running process
@Injectable({providedIn: 'root'})
export class ProcessMonitorService {
  public static readonly DEFAULT_GROUP: string = 'Long-Running Process';

  private processMap: Map<string,ProcessHolder<any>> = new Map<string,ProcessHolder<any>>();
  private modalProcessMap: Map<string,ProcessHolder<any>> = new Map<string,ProcessHolder<any>>();

  public get showDisplay(): boolean {
    return this.processMap.size>0;
  }

  public get showModelDisplay(): boolean {
    return this.modalProcessMap.size>0;
  }

  // Fire and forget
  public fafMonitorProcessDefaultLabel<T>(promise: Promise<T>, modal?: boolean): void {
    this.monitorProcessSimple(promise, 'Processing...', modal).then(No.op);
  }

  public fafMonitorProcessSimple<T>(promise: Promise<T>, label: string | BehaviorSubject<string>, modal?: boolean): void {
    const descriptor: BehaviorSubject<ProcessMonitorState> =
      label instanceof BehaviorSubject ?
        ProcessMonitorService.labelSubjectToProcessInput(label as BehaviorSubject<string>):
        new BehaviorSubject<ProcessMonitorState>(ProcessMonitorService.labelToProcessInput(label as string)) ;
    this.monitorProcess(promise, descriptor, modal).then(No.op);
  }

  public fafMonitorProcess<T>(promise: Promise<T>, descriptor: ProcessMonitorState | BehaviorSubject<ProcessMonitorState>, modal?: boolean): void {
    const map: Map<string, ProcessHolder<any>> = modal? this.modalProcessMap : this.processMap;
    this.innerMonitorProcess(promise, descriptor, map).then(No.op);
  }



  public async monitorProcessDefaultLabel<T>(promise: Promise<T>, modal?: boolean): Promise<T> {
    return this.monitorProcessSimple(promise, 'Processing...', modal);
  }

  public async monitorProcessSimple<T>(promise: Promise<T>, label: string | BehaviorSubject<string>, modal?: boolean): Promise<T> {
    const descriptor: BehaviorSubject<ProcessMonitorState> =
      label instanceof BehaviorSubject ?
        ProcessMonitorService.labelSubjectToProcessInput(label as BehaviorSubject<string>):
        new BehaviorSubject<ProcessMonitorState>(ProcessMonitorService.labelToProcessInput(label as string)) ;
    return this.monitorProcess(promise, descriptor, modal);
  }

  public async monitorProcess<T>(promise: Promise<T>, descriptor: ProcessMonitorState | BehaviorSubject<ProcessMonitorState>, modal?: boolean): Promise<T> {
    const map: Map<string, ProcessHolder<any>> = modal? this.modalProcessMap : this.processMap;
    return this.innerMonitorProcess(promise, descriptor, map);
  }



  private async innerMonitorProcess<T>(promise: Promise<T>, descriptor: ProcessMonitorState | BehaviorSubject<ProcessMonitorState>, map: Map<string,ProcessHolder<any>>): Promise<T> {
    RequireRatchet.notNullOrUndefined(promise, 'promise');
    RequireRatchet.notNullOrUndefined(descriptor, 'descriptor');

    let bh: BehaviorSubject<ProcessMonitorState>;
    if (descriptor instanceof BehaviorSubject) {
      const init: ProcessMonitorState = Object.assign({}, this.defaultInput(), descriptor.value);
      bh = descriptor;
      bh.next(init); // fill in any missing values
    } else {
      const init: ProcessMonitorState = Object.assign({}, this.defaultInput(), descriptor);
      bh = new BehaviorSubject<ProcessMonitorState>(init);
    }

    const holder: ProcessHolder<T> = {
      guid: StringRatchet.createRandomHexString(10),
      proc: promise,
      input: bh
    };
    map.set(holder.guid, holder);

    const finished: Promise<T> = holder.proc.finally(()=>{
      map.delete(holder.guid);
    });

    return finished;
  }

  private mapToGroupedProcessList(map: Map<string, ProcessHolder<any>>): BehaviorSubject<ProcessMonitorState>[] {
    if (map.size>0) {
      //debugger;
    }
    let tmp: BehaviorSubject<ProcessMonitorState>[] = Array.from(map.values()).map(v=>v.input)
      .filter(x=>!!x?.value)
    tmp = tmp.sort((a,b)=>a.value.group.localeCompare(b.value.group));

    const rval: BehaviorSubject<ProcessMonitorState>[] = [];

    while (tmp.length>1) {
      let lastIdx: number = 1;
      while (lastIdx<tmp.length && tmp[lastIdx].value.group === tmp[0].value.group) {
        lastIdx++;
      }
      if (lastIdx>1) {
        rval.push(new BehaviorSubject<ProcessMonitorState>({
          label: tmp[0].value.group,
          detail: lastIdx+' running...',
          group: tmp[0].value.group,
          percentComplete: null
        }));
      } else {
        rval.push(tmp[0]);
      }
      tmp.splice(0, lastIdx);
    }

    if (tmp.length) {
      rval.push(tmp[0]);
    }

    return rval;
  }

  public get processes(): BehaviorSubject<ProcessMonitorState>[] {
    return this.mapToGroupedProcessList(this.processMap);
  }

  public get modalProcesses(): BehaviorSubject<ProcessMonitorState>[] {
    return this.mapToGroupedProcessList(this.modalProcessMap);
  }


  public static labelToProcessInput(label: string): ProcessMonitorState {
    return {
      label: label,
      detail: null,
      group: ProcessMonitorService.DEFAULT_GROUP,
      percentComplete: null
    };
  }

  public static labelSubjectToProcessInput(label: BehaviorSubject<string>): BehaviorSubject<ProcessMonitorState> {
    const val: ProcessMonitorState = ProcessMonitorService.labelToProcessInput(label.value);
    const rval: BehaviorSubject<ProcessMonitorState> = new BehaviorSubject<ProcessMonitorState>(val);
    label.subscribe((val)=>rval.next(ProcessMonitorService.labelToProcessInput(val)));
    return rval;
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
