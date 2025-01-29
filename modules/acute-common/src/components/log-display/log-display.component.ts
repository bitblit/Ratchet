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

@Component({
  selector: 'ngx-acute-common-log-display',
  templateUrl: './log-display.component.html',
  styleUrls: [],
  standalone: true,
  imports: [CardModule, ButtonModule, TooltipModule, DividerModule, InputTextModule, Drawer, TableModule, AsyncPipe]

})
export class LogDisplayComponent {
  @Input() public buttonIcon: string = 'pi pi-arrow-up';
  @Input() public displayShowIcon: boolean = true;
  public visible: boolean = false;
  public snap: BehaviorSubject<LogMessage[]> = new BehaviorSubject<LogMessage[]>(this.fetchMessagesCopy());
  public updatedEpoch: number;

  constructor(
    public router: Router,
  ) {
  }

  public fetchMessagesCopy(): LogMessage[] {
    const rval: LogMessage[] = Object.assign([], Logger.getRingBuffer().getMessages().reverse());
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

}
