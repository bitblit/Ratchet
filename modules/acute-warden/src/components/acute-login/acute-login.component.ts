import { AfterViewChecked, Component, Input } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { WardenClient } from '@bitblit/ratchet-warden-common/client/warden-client';
import { WardenUserService } from '@bitblit/ratchet-warden-common/client/warden-user-service';
import { StringRatchet } from '@bitblit/ratchet-common/lang/string-ratchet';
import { WardenContact } from '@bitblit/ratchet-warden-common/common/model/warden-contact';
import { WardenRecentLoginDescriptor } from '@bitblit/ratchet-warden-common/client/provider/warden-recent-login-descriptor';
import { WardenUtils } from '@bitblit/ratchet-warden-common/common/util/warden-utils';
import { WardenContactType } from '@bitblit/ratchet-warden-common/common/model/warden-contact-type';
import { WardenLoggedInUserWrapper } from '@bitblit/ratchet-warden-common/client/provider/warden-logged-in-user-wrapper';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { FieldsetModule } from 'primeng/fieldset';
import { AlertComponent } from '@bitblit/ngx-acute-common';
import { DialogService } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { RequireRatchet } from '@bitblit/ratchet-common/lang/require-ratchet';
import { InputOtpModule } from 'primeng/inputotp';
import { AccordionModule } from 'primeng/accordion';
import { TabViewModule } from 'primeng/tabview';
import { SplitButtonModule } from 'primeng/splitbutton';
import { InputGroupModule } from 'primeng/inputgroup';
import { ToolbarModule } from 'primeng/toolbar';

@Component({
  selector: 'ngx-acute-warden-login',
  templateUrl: './acute-login.component.html',
  standalone: true,
  imports: [
    ButtonModule,
    RouterModule,
    FormsModule,
    CommonModule,
    CardModule,
    TooltipModule,
    ButtonModule,
    FieldsetModule,
    InputTextModule,
    InputOtpModule,
    AccordionModule,
    TabViewModule,
    SplitButtonModule,
    InputGroupModule,
    ToolbarModule,
  ],
})
export class AcuteLoginComponent implements AfterViewChecked {
  @Input() public applicationName: string;
  @Input() public helperText: string;

  @Input() public postLoginUrl: string;

  public verificationCode: string;
  public waitingContact: WardenContact;
  public showCodePage: boolean = false;

  public newContactValue: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public userService: WardenUserService<any>,
    public wardenClient: WardenClient,
    private dlgService: DialogService,
  ) {
    Logger.info('Found %s recent logins', this.recentLogins.length);
  }

  public userById(index: number, ld: WardenRecentLoginDescriptor) {
    return ld.user.userId;
  }

  public contactByName(index: number, contact: WardenContact) {
    return contact.value;
  }

  public get hasRecentLogins(): boolean {
    return this.recentLogins.length > 0;
  }

  public get recentLogins(): WardenRecentLoginDescriptor[] {
    const rval: WardenRecentLoginDescriptor[] = this.userService?.serviceOptions?.recentLoginProvider?.fetchAllLogins() || [];
    return rval;
  }

  public clearSavedLogins(): void {
    if (confirm('Are you sure you want to clear saved logins?')) {
      this.userService.serviceOptions.recentLoginProvider.clearAllLogins();
    }
  }

  ngAfterViewChecked(): void {
    //Logger.info('ngi: %j', this.route.queryParamMap);
    RequireRatchet.notNullUndefinedOrOnlyWhitespaceString(this.postLoginUrl, 'postLoginUrl may not be empty');
  }

  public async sendCodeToNewContact(value: string): Promise<void> {
    Logger.info('Trying to send code to %s %s %s', value, WardenUtils.stringIsEmailAddress(value), WardenUtils.stringIsPhoneNumber(value));
    if (StringRatchet.trimToNull(value)) {
      let ct: WardenContactType = null;
      if (WardenUtils.stringIsEmailAddress(value)) {
        ct = WardenContactType.EmailAddress;
      } else if (WardenUtils.stringIsPhoneNumber(value)) {
        ct = WardenContactType.TextCapablePhoneNumber;
      }
      if (!ct) {
        AlertComponent.showAlert(this.dlgService, 'Cannot treat this as an email or a phone number - ignoring');
      } else {
        this.waitingContact = { type: ct, value: value };
        const val: boolean = await this.userService.sendExpiringCode(this.waitingContact);
        if (val) {
          this.showCodePage = true;
        } else {
          AlertComponent.showAlert(this.dlgService, 'Failed to send code');
        }
      }
    }
  }

  public async sendCodeToContact(contact: WardenContact): Promise<void> {
    Logger.info('Send code to contact %j', contact);
    if (contact && StringRatchet.trimToNull(contact.value) && contact.type) {
      this.waitingContact = contact;
      const val: boolean = await this.userService.sendExpiringCode(contact);
      if (val) {
        this.showCodePage = true;
      } else {
        AlertComponent.showAlert(this.dlgService, 'Failed to send code');
      }
    } else {
      Logger.info('Failed to send code to contact : %j', contact);
    }
  }

  public async submitVerificationCode(input: string, verificationCode: string): Promise<void> {
    Logger.info('Submit: %s, %s', input, verificationCode);
    const val: WardenLoggedInUserWrapper<any> = await this.userService.executeValidationTokenBasedLogin(
      { type: WardenUtils.stringToContactType(input), value: input },
      verificationCode,
    );
    if (val) {
      await this.router.navigate([this.postLoginUrl]);
    } else {
      AlertComponent.showAlert(this.dlgService, 'Code submission failed');
    }
  }

  public async processWebAuthnLogin(userId: string): Promise<void> {
    Logger.info('processWebAuthnLogin: %s', userId);
    const val: WardenLoggedInUserWrapper<any> = await this.userService.executeWebAuthnBasedLogin(userId);
    if (val) {
      await this.router.navigate([this.postLoginUrl]);
    } else {
      AlertComponent.showAlert(this.dlgService, 'Web authentication method failed');
    }
  }

  public removeSingleLogin(userId: string): void {
    this.userService.serviceOptions.recentLoginProvider.removeUser(userId);
  }

  public contactValueInvalidAndDirty(): boolean {
    return (
      StringRatchet.trimToNull(this.newContactValue) &&
      !WardenUtils.stringIsPhoneNumber(this.newContactValue) &&
      !WardenUtils.stringIsEmailAddress(this.newContactValue)
    );
  }
}
