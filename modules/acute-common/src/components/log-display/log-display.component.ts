import {Component, Input} from '@angular/core';
import {Router} from '@angular/router';
import {CardModule} from "primeng/card";
import {ButtonModule} from "primeng/button";
import {TooltipModule} from "primeng/tooltip";
import {DividerModule} from "primeng/divider";
import {InputTextModule} from "primeng/inputtext";
import {Drawer} from "primeng/drawer";
import {TableModule} from "primeng/table";
import {BehaviorSubject} from "rxjs";
import {AsyncPipe} from "@angular/common";
import { LogMessage } from "@bitblit/ratchet-common/logger/log-message";
import { Logger } from "@bitblit/ratchet-common/logger/logger";
import { DurationRatchet } from "@bitblit/ratchet-common/lang/duration-ratchet";
import { LoggerUtil } from "@bitblit/ratchet-common/logger/logger-util";
import { SelectButton } from "primeng/selectbutton";
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'ngx-acute-common-log-display',
  templateUrl: './log-display.component.html',
  styleUrls: [],
  standalone: true,
  imports: [CardModule, ButtonModule, TooltipModule, DividerModule, InputTextModule, Drawer, TableModule, AsyncPipe, SelectButton, FormsModule]

})
export class LogDisplayComponent {
  @Input() public buttonIcon: string = 'pi pi-arrow-up';
  @Input() public displayShowIcon: boolean = true;
  @Input() public hotkeyEnabled: boolean = true;
  public visible: boolean = false;
  public snap: BehaviorSubject<LogMessage[]> = new BehaviorSubject<LogMessage[]>(this.fetchMessagesCopy());
  public updatedEpoch: number;

  public levelFilterIdx: number = LoggerUtil.loggerLevelIndex(LoggerLevelName.info);
  public levelFilterOptions: any[]

  constructor(
    public router: Router,
  ) {
    const loggerLevel: number = LoggerUtil.loggerLevelIndex(Logger.getLevel());
    this.levelFilterOptions = [];
    for (let i=0;i<=loggerLevel;i++) {
      this.levelFilterOptions.push({label: LoggerUtil.indexToLevel(i), value: i});
    }
  }

  public filterLevelChange(delta: number): void {
    const loggerLevel: number = LoggerUtil.loggerLevelIndex(Logger.getLevel());
    const newLevelIdx: number = this.levelFilterIdx + delta;
    if (newLevelIdx <= loggerLevel) {
      if (LoggerUtil.indexToLevel(newLevelIdx)) {
        this.levelFilterIdx = newLevelIdx;
        this.refresh();
      }
    } else {
      // Cant take it below what's being logged
    }
  }


  public levelLoggedIdx(): number {
    return LoggerUtil.loggerLevelIndex(Logger.getLevel());
  }

  public levelLogged(): LoggerLevelName {
    return Logger.getLevel();
  }

  public levelFilter(): LoggerLevelName {
    const rval: LoggerLevelName = LoggerUtil.indexToLevel(this.levelFilterIdx);
    return rval;
  }

  public fetchMessagesCopy(): LogMessage[] {
    let rval: LogMessage[] = Object.assign([], Logger.getRingBuffer().getMessages().reverse());
    rval = rval.filter(r=>{return LoggerUtil.levelIsEnabled(r.lvl, this.levelFilter())})

    return rval;
  }


  public refresh(): void {
    this.snap.next(this.fetchMessagesCopy());
    this.updatedEpoch = Date.now();
  }

  public formatTime(tm: number): string {
    const rval: string = new Date(tm).toLocaleTimeString()+ '   (' + DurationRatchet.thinFormatMsDuration(Date.now() - tm) +' ago)';
    return rval;
  }

  public format(lm: LogMessage): string {
    const rval: string = Logger.getLogger().formatMessage(lm);
    return rval;
  }

  public open(): void {
    this.refresh();
    this.visible = true;
  }

  @HostListener('document:keypress', ['$event'])
  systemKeypress(evt: KeyboardEvent) {
    if (this.hotkeyEnabled && evt.code === 'KeyL' && evt.ctrlKey  && evt.shiftKey) {
      if (this.visible) {
        this.visible = false;
      } else {
        this.open();
      }
    }
  }

}
