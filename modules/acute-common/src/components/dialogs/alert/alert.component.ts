import { Component } from '@angular/core';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { BehaviorSubject } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'ngx-acute-common-alert',
  template: '<div><pre>{{cfg.data.message | async}}</pre></div>',
  standalone: true,
  imports: [AsyncPipe],
})
export class AlertComponent {
  constructor(
    public cfg: DynamicDialogConfig,
    protected ref: DynamicDialogRef,
  ) {
    Logger.info('Creating with %j', this.cfg);
  }

  public static showAlert(dialogSvc: DialogService, message: BehaviorSubject<string> | string, title: string = 'Alert'): DynamicDialogRef {
    const dlg: DynamicDialogRef = dialogSvc.open(AlertComponent, {
      //disableClose: true,
      //autoFocus: true,
      data: {
        message: message instanceof BehaviorSubject ? message : new BehaviorSubject<string>(message),
      },
      header: title,
    });
    return dlg;
  }
}
