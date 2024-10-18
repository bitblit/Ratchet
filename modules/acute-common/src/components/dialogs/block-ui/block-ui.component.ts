import { Component } from "@angular/core";
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { BehaviorSubject } from "rxjs";
import { Logger } from "@bitblit/ratchet-common/logger/logger";

@Component({
  selector: 'ngx-acute-common-block-ui',
  templateUrl: './block-ui.component.html',
})
export class BlockUiComponent {
  constructor(
    private dialogService: DialogService,
    public cfg: DynamicDialogConfig,
  ) {}

  public static createUiBlock(
    dialogService: DialogService,
    message: BehaviorSubject<string> | string = 'Please wait...',
    subMessage?: string,
  ): DynamicDialogRef {
    const dlg: DynamicDialogRef = dialogService.open(BlockUiComponent, {
      closable: false,
      modal: true,
      data: {
        message: message instanceof BehaviorSubject ? message : new BehaviorSubject<string>(message),
        subMessage: subMessage,
      },
    });
    return dlg;
  }

  public static async runPromiseWithUiBlock<T>(
    dialogService: DialogService,
    prom: Promise<T>,
    message: BehaviorSubject<string> | string = 'Please wait...',
    subMessage?: string,
  ): Promise<T> {
    const dlg = dialogService.open(BlockUiComponent, {
      closable: false,
      modal: true,
      data: {
        message: message instanceof BehaviorSubject ? message : new BehaviorSubject<string>(message),
        subMessage: subMessage,
      },
    });

    try {
      const rval: T = await prom;
      dlg?.close(rval); // If it is still open, close it
      Logger.info('Blockui - Received %j - closing blocker ui and returning', rval);
      return rval;
    } catch (err) {
      Logger.error('Caught error inside block ui dialog : %s - rethrowing', err, err);
      dlg?.close(); // If it is still open, close it
      throw err;
    }
  }
}
