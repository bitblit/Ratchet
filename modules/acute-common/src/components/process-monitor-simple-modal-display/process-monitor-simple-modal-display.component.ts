import { Component, Input } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ContextMenuModule } from "primeng/contextmenu";
import { CardModule } from "primeng/card";
import { MultiSelectModule } from "primeng/multiselect";
import { TableModule } from "primeng/table";
import { PanelModule } from "primeng/panel";
import { InputGroupAddonModule } from "primeng/inputgroupaddon";
import { InputGroupModule } from "primeng/inputgroup";
import { ProgressBar } from "primeng/progressbar";
import { Dialog } from "primeng/dialog";
import { ProcessMonitorService } from "../../services/process-monitor/process-monitor-service";


@Component({
  selector: 'ngx-acute-common-process-monitor-simple-modal-display',
  templateUrl: './process-monitor-simple-modal-display.component.html',
  imports: [
    CardModule,
    MultiSelectModule,
    ContextMenuModule,
    TableModule,
    ReactiveFormsModule,
    PanelModule,
    InputGroupAddonModule,
    InputGroupModule,
    FormsModule,
    ProgressBar,
    Dialog
  ],
  standalone: true
})
export class ProcessMonitorSimpleModalDisplayComponent {
  @Input() public header: string=null;

  constructor(
    public processMonitorService: ProcessMonitorService
  ) {
  }

}
