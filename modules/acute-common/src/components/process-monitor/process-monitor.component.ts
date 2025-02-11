import { Component, Input } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ContextMenuModule } from "primeng/contextmenu";
import { CardModule } from "primeng/card";
import { MultiSelectModule } from "primeng/multiselect";
import { TableModule } from "primeng/table";
import { PanelModule } from "primeng/panel";
import { SidebarModule } from "primeng/sidebar";
import { InputGroupAddonModule } from "primeng/inputgroupaddon";
import { InputGroupModule } from "primeng/inputgroup";
import { InputSwitchModule } from "primeng/inputswitch";
import { AsyncPipe, NgForOf, NgIf } from "@angular/common";
import { ProgressBar } from "primeng/progressbar";
import { Dialog } from "primeng/dialog";
import { ProcessMonitorService } from "../../services/process-monitor/process-monitor-service";


@Component({
  selector: 'ngx-acute-common-process-monitor',
  templateUrl: './process-monitor.component.html',
  imports: [
    CardModule,
    MultiSelectModule,
    ContextMenuModule,
    TableModule,
    ReactiveFormsModule,
    PanelModule,
    SidebarModule,
    InputGroupAddonModule,
    InputGroupModule,
    InputSwitchModule,
    FormsModule,
    NgForOf,
    AsyncPipe,
    ProgressBar,
    NgIf,
    Dialog
  ],
  standalone: true
})
export class ProcessMonitorComponent {
  @Input() public modalHeader: string=null;
  @Input() public normalHeader: string=null;

  constructor(
    public processMonitorService: ProcessMonitorService
  ) {
  }

}
