import { Component } from '@angular/core';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { BehaviorSubject } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { AsyncPipe } from "@angular/common";

@Component({
  selector: 'ngx-acute-common-alert',
  template:
    '<div style="display: flex; flex-direction:column; width: 33vw; max-height: 25vh; gap: 5px">' +
    '<pre style="width: 30vw; max-height: 80%;white-space: pre-wrap">{{cfg.data.message | async}}</pre>' +
    '<div style="display:flex; flex-direction: row; justify-content: flex-end">' +
    '<p-button label="Ok" severity="primary" (click)="ref.close()" />' +
    '</div></div>',
  standalone: true,
  imports: [ButtonModule, AsyncPipe],
})
export class AlertComponent {
  constructor(
    public cfg: DynamicDialogConfig,
    protected ref: DynamicDialogRef,
  ) {
    Logger.info('Creating AlertComponent with %j', this.cfg);
  }

  public static showAlert(dialogSvc: DialogService, message: BehaviorSubject<string> | string, title: string = 'Alert'): DynamicDialogRef {
    const dlg: DynamicDialogRef = dialogSvc.open(AlertComponent, {
      //disableClose: true,
      //autoFocus: true,
      data: {
        message: message instanceof BehaviorSubject ? message : new BehaviorSubject<string>(message),
      },
      header: title,
      modal: true,
      maximizable: false,
      position: 'top',
    });
    return dlg;
  }
}
