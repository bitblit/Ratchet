import {Component} from '@angular/core';
import {Router} from '@angular/router';

import {Logger} from '@bitblit/ratchet-common/logger/logger';
import {WardenUserService} from "@bitblit/ratchet-warden-common/client/warden-user-service";
import {No} from "@bitblit/ratchet-common/lang/no";
import { CardModule } from "primeng/card";
import { Button } from "primeng/button";
import { JsonPipe, NgIf } from "@angular/common";

@Component({
  selector: "ngx-acute-warden-user-profile",
  templateUrl: "./user-profile.component.html",
  imports: [
    CardModule,
    Button,
    JsonPipe,
    NgIf
  ],
  standalone: true
})
export class UserProfileComponent {
  public user: any = { name: 'x', email: 'y' };
  constructor(
    private router: Router,
    public userService: WardenUserService<any>,
  ) {
    Logger.info('Construct userprofile');
  }

  performLogout(): void {
    this.userService.logout();
    this.router.navigate(['/public/login']).then(No.op);
  }

}
