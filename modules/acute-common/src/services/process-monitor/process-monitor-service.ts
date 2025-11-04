import { computed, Injectable, Signal, signal, WritableSignal } from "@angular/core";
import {RequireRatchet} from "@bitblit/ratchet-common/lang/require-ratchet";
import {ProcessMonitorState} from './process-monitor-state';
import {StringRatchet} from "@bitblit/ratchet-common/lang/string-ratchet";
import {No} from "@bitblit/ratchet-common/lang/no";
import {ProcessHolder} from "./process-holder";
import { MonitoredProcesses } from "./monitored-processes";
import { Logger } from "@bitblit/ratchet-common/logger/logger";
import { AcuteCommonTypeGuards } from "../../acute-common-type-guards";

// Service for providing visual feedback on an ongoing long-running process
@Injectable({providedIn: 'root'})
export class ProcessMonitorService {
  public static readonly DEFAULT_GROUP: string = 'Long-Running Process';
  private _defaultLabel: string = 'Processing...';

  private processes: WritableSignal<MonitoredProcesses> = signal({processes:[]});

  public hasModalProcesses(): Signal<boolean> {
    return computed(
      ()=>{
        const rval: boolean = this.modalProcesses()().processes.length>0;
        return rval;
      });
  }

  public hasStandardProcesses(): Signal<boolean> {
    return computed(
      ()=>{
        const rval: boolean = this.standardProcesses()().processes.length>0;
        return rval;
      });
  }


  public modalProcesses(): Signal<MonitoredProcesses> {
    const rval: Signal<MonitoredProcesses> = computed(()=>{
      const r: ProcessHolder<any>[] = this.processes().processes;
      const modalOnly: ProcessHolder<any>[] = r.filter(s=>s.modal);
      return {processes:modalOnly};
    });
    return rval;
  }

  public standardProcesses(): Signal<MonitoredProcesses> {
    return computed(()=>{
      const r: ProcessHolder<any>[] = this.processes().processes;
      const modalOnly: ProcessHolder<any>[] = r.filter(s=>!s.modal);
      return {processes:modalOnly};
    });
  }

  public get defaultLabel(): string {
    return this._defaultLabel;
  }

  public set defaultLabel(val: string) {
    this._defaultLabel = val;
  }

  // Fire and forget - just so you don't get warnings about the promise not being handled
  public fafMonitorProcessDefaultLabel<T>(promise: Promise<T>, modal?: boolean): void {
    this.monitorProcessSimple(promise, this.defaultLabel, modal).then(No.op);
  }

  // Fire and forget - just so you don't get warnings about the promise not being handled
  public fafMonitorProcessSimple<T>(promise: Promise<T>, label: string, modal?: boolean): void {
    this.monitorProcessSimple(promise, label, modal).then(No.op);
  }

  public fafMonitorProcess<T>(promise: Promise<T>, descriptor: ProcessMonitorState | WritableSignal<ProcessMonitorState>, modal?: boolean): void {
    this.monitorProcess(promise, descriptor, modal).then(No.op);
  }

  public monitorProcessDefaultLabel<T>(promise: Promise<T>, modal?: boolean): Promise<T> {
    return this.monitorProcessSimple(promise, this.defaultLabel, modal);
  }

  public monitorProcessSimple<T>(promise: Promise<T>, label: string, modal?: boolean): Promise<T> {
    return this.monitorProcess(promise, ProcessMonitorService.labelToProcessInput(label), modal);
  }

  public monitorProcess<T>(promise: Promise<T>, descriptor: ProcessMonitorState | WritableSignal<ProcessMonitorState>, modal?: boolean): Promise<T> {
    const val:ProcessHolder<T> = this.innerMonitorProcess(promise, descriptor, modal);
    return val.proc;
  }

  public monitorProcessWithUpdate<T>(promise: Promise<T>, descriptor: ProcessMonitorState | WritableSignal<ProcessMonitorState>, modal?: boolean): ProcessHolder<T> {
    return this.innerMonitorProcess(promise, descriptor, modal);
  }

  public updatePercentCompleteByGuid(guid: string, pct:number): void {
    const old: MonitoredProcesses = this.processes();
    const tgt: ProcessHolder<any> = old.processes.find(s=>s.guid===guid);
    if (tgt) {
      ProcessMonitorService.updateSignalPercent(tgt.input, pct);
    } else {
      Logger.warn('Could not find process with guid %s to update', guid);
    }
  }

  public updateLabelByGuid(guid: string, newLabel: string): void {
    const old: MonitoredProcesses = this.processes();
    const tgt: ProcessHolder<any> = old.processes.find(s=>s.guid===guid);
    if (tgt) {
      ProcessMonitorService.updateSignalLabel(tgt.input, newLabel);
    } else {
      Logger.warn('Could not find process with guid %s to update', guid);
    }
  }

  public updateDetailByGuid(guid: string, newDetail: string): void {
    const old: MonitoredProcesses = this.processes();
    const tgt: ProcessHolder<any> = old.processes.find(s=>s.guid===guid);
    if (tgt) {
      ProcessMonitorService.updateSignalDetail(tgt.input, newDetail);
    } else {
      Logger.warn('Could not find process with guid %s to update', guid);
    }
  }


  public static updateSignalPercent(inp: WritableSignal<ProcessMonitorState>, pct: number): void {
    const old: ProcessMonitorState = inp();
    old.percentComplete = pct;
    inp.set(old);
  }

  public static updateSignalLabel(inp: WritableSignal<ProcessMonitorState>, newLabel: string): void {
    const old: ProcessMonitorState = inp();
    old.label = newLabel;
    inp.set(old);
  }

  public static updateSignalDetail(inp: WritableSignal<ProcessMonitorState>, newDetail: string): void {
    const old: ProcessMonitorState = inp();
    old.detail = newDetail;
    inp.set(old);
  }

  private innerMonitorProcess<T>(promise: Promise<T>, descriptor: ProcessMonitorState | WritableSignal<ProcessMonitorState>, modal: boolean = false): ProcessHolder<T> {
    RequireRatchet.notNullOrUndefined(promise, 'promise');
    RequireRatchet.notNullOrUndefined(descriptor, 'descriptor');

    const guid: string = StringRatchet.createRandomHexString(10);
    const descSig: WritableSignal<ProcessMonitorState> = AcuteCommonTypeGuards.isProcessMonitorState(descriptor) ? signal(descriptor) : descriptor;

    const wrapped: Promise<T> = promise.finally(()=>{
      Logger.info('Process %s finished - removing', holder.guid);
      const newProc: ProcessHolder<any>[] = this.processes().processes.filter(s=>s.guid!==guid);
      this.processes.set({processes: newProc});
    });

    const holder: ProcessHolder<T> = {
      guid: guid,
      proc: wrapped,
      input: descSig,
      group: ProcessMonitorService.DEFAULT_GROUP,
      modal: modal
    };

    const oldProc: ProcessHolder<any>[] = this.processes().processes;
    oldProc.push(holder);
    this.processes.set({processes:oldProc});

    return holder;
  }


  public static labelToProcessInput(label: string): ProcessMonitorState {
    return {
      label: label,
      detail: null,
      percentComplete: null
    };
  }

}
