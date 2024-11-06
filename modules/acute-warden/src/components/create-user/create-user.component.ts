import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';

import {Logger} from '@bitblit/ratchet-common/logger/logger';
import {WardenClient} from "@bitblit/ratchet-warden-common/client/warden-client";
import {No} from "@bitblit/ratchet-common/lang/no";
import {StringRatchet} from "@bitblit/ratchet-common/lang/string-ratchet";
import {AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {WardenContactType} from "@bitblit/ratchet-warden-common/common/model/warden-contact-type";
import {EnumRatchet} from "@bitblit/ratchet-common/lang/enum-ratchet";
import {MessagesModule} from "primeng/messages";
import {CommonModule} from "@angular/common";
import {CardModule} from "primeng/card";
import {ButtonModule} from "primeng/button";
import {DropdownModule} from "primeng/dropdown";
import {AlertComponent} from "@bitblit/ngx-acute-common";
import {DialogService} from "primeng/dynamicdialog";
import { Ripple } from "primeng/ripple";
import { InputTextModule } from "primeng/inputtext";

@Component({
  selector: 'ngx-acute-warden-create-user',
  templateUrl: './create-user.component.html',
  standalone: true,
  imports: [MessagesModule, RouterModule, FormsModule, ReactiveFormsModule, CommonModule, CardModule, ButtonModule, DropdownModule, Ripple, InputTextModule]
})
export class CreateUserComponent implements OnInit {
  public form: FormGroup;

  public userContactTypes: string[] = EnumRatchet.listEnumKeys(WardenContactType);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private wardenClient: WardenClient,
    private fb: FormBuilder,
    private dlgService: DialogService,
  ) {
    this.form = this.fb.group(
      {
        userFullName: [null, Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(35)])],
        userContactValue: [null, Validators.compose([Validators.required, Validators.email])],
        userContactType: [StringRatchet.safeString(WardenContactType.EmailAddress), Validators.compose([Validators.required])],
      },
      { validators: [] },
    );
  }

  public f(name: string): AbstractControl {
    return this.form.controls[name];
  }

  ngOnInit(): void {
    Logger.info('ngi: %j', this.route.queryParamMap);
  }

  public async createUser(): Promise<void> {
    try {
      const type: WardenContactType = EnumRatchet.keyToEnum<WardenContactType>(
        WardenContactType,
        this.form.controls['userContactType'].value,
        false,
      );
      if (
        StringRatchet.trimToNull(this.form.controls['userContactValue'].value) &&
        StringRatchet.trimToNull(this.form.controls['userFullName'].value) &&
        type
      ) {
        const userId: string = await this.wardenClient.createAccount(
          { type: type, value: this.form.controls['userContactValue'].value },
          true,
          this.form.controls['userFullName'].value,
          [],
        );
        Logger.info('Got user id %s', userId);
        this.router.navigate(['/public/login']).then(No.op);
      } else {
        AlertComponent.showAlert(this.dlgService, 'Missing data');
      }
    } catch (err) {
      AlertComponent.showAlert(this.dlgService, 'Failed: ' + err);
    }
  }
}
